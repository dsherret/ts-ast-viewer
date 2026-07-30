//go:build wasip1

// Command tsgo-wasm builds the TypeScript API server as a WebAssembly reactor
// (GOOS=wasip1, -buildmode=c-shared) that a JS host drives synchronously.
//
// This file is copied into a typescript-go checkout as cmd/tsgo-wasm/main.go by
// scripts/buildTsgo.ts. It is purely additive — nothing in the checkout is
// modified — so it applies unchanged to any upstream ref, which is what lets the
// nightly and each new release keep building. Everything it touches is exported
// API (api.NewSession, project.NewSession, bundled.WrapFS, vfstest.FromMap); if
// upstream renames one of those the Go build fails naming the symbol, rather
// than silently producing a broken wasm.
//
// The protocol, all synchronous:
//
//   - create_session(ptr, len) once, with JSON options. 0 on success, 1 with the
//     reason in the response buffer.
//   - get_request_buffer(size) for a shared buffer, write the method bytes then
//     the JSON payload into it, then handle_request(methodLen, payloadLen). The
//     status is the return value (0 ok, 1 error); the response is read from
//     response_ptr()/response_len(), and response_is_binary() says whether those
//     bytes are msgpack-encoded node data or JSON.
//   - set_file / remove_file mutate the in-memory file system the compiler reads,
//     through the same shared buffer.
//
// Unlike the upstream --api server there is no transport and no client
// callbacks: the file system lives in the module (an in-memory vfs plus the
// embedded lib.*.d.ts) and the host mutates it directly, so the module imports
// nothing but WASI. One request runs to completion per call.
package main

import (
	"context"
	"fmt"
	"runtime/debug"
	"unsafe"

	"github.com/microsoft/typescript-go/internal/api"
	"github.com/microsoft/typescript-go/internal/bundled"
	"github.com/microsoft/typescript-go/internal/json"
	"github.com/microsoft/typescript-go/internal/lsp/lsproto"
	"github.com/microsoft/typescript-go/internal/project"
	"github.com/microsoft/typescript-go/internal/vfs"
	"github.com/microsoft/typescript-go/internal/vfs/vfstest"
)

func main() {}

var (
	ctx = context.Background()

	session *api.Session
	// files is the writable in-memory file system the host mutates. The session
	// reads it through bundled.WrapFS, which serves the embedded lib.*.d.ts and
	// passes everything else through to this.
	files vfs.FS

	// reqBuf holds the incoming method + payload for the current request.
	reqBuf []byte

	// respBuf holds the outgoing response until the next request overwrites it;
	// it stays referenced so the pointer handed to the host remains valid.
	respBuf    []byte
	respPtr    uint32
	respLen    uint32
	respBinary uint32

	// inCall guards the exported entry points. The shared request and response
	// buffers are single-slot, so re-entering an export while a request is in
	// flight would clobber it. Reject that instead.
	inCall bool
)

// sessionOptions is the JSON payload create_session is given.
type sessionOptions struct {
	Cwd string `json:"cwd"`
	// UseCaseSensitiveFileNames describes the host's file system. Nil keeps the
	// case-sensitive default.
	UseCaseSensitiveFileNames *bool `json:"useCaseSensitiveFileNames"`
}

// create_session builds the API session from the JSON options in the request
// buffer. It must be called once before handle_request.
//
//go:wasmexport create_session
func createSession(optsPtr, optsLen uint32) (status uint32) {
	if session != nil {
		return fail("session already created")
	}
	// Construction can panic, and an unrecovered panic in an export kills the
	// module for good rather than failing the one call.
	defer func() {
		if r := recover(); r != nil {
			session = nil
			status = fail(fmt.Sprintf("panic creating session: %v\n%s", r, debug.Stack()))
		}
	}()

	var options sessionOptions
	if err := json.Unmarshal(readMem(optsPtr, optsLen), &options); err != nil {
		return fail(fmt.Sprintf("invalid session options: %v", err))
	}
	if options.Cwd == "" {
		options.Cwd = "/"
	}
	useCaseSensitiveFileNames := options.UseCaseSensitiveFileNames == nil || *options.UseCaseSensitiveFileNames

	files = vfstest.FromMap(map[string]string{}, useCaseSensitiveFileNames)

	// Mirrors api.StdioServer.Run, minus the transport and the client callbacks.
	projectSession := project.NewSession(&project.SessionInit{
		BackgroundCtx: ctx,
		FS:            bundled.WrapFS(files),
		Options: &project.SessionOptions{
			CurrentDirectory:   options.Cwd,
			DefaultLibraryPath: bundled.LibPath(),
			PositionEncoding:   lsproto.PositionEncodingKindUTF8,
			LoggingEnabled:     false,
		},
	})
	session = api.NewSession(projectSession, &api.SessionOptions{
		// The msgpack node encoding the client decodes source files from.
		UseBinaryResponses: true,
	})
	setResponse(nil, false)
	return 0
}

// close_session releases the session's resources. Further requests fail until
// create_session is called again.
//
//go:wasmexport close_session
func closeSession() {
	if session == nil {
		return
	}
	s := session
	session = nil
	files = nil
	defer func() { _ = recover() }()
	s.Close()
}

// get_request_buffer ensures the shared request buffer holds at least size bytes
// and returns a pointer to its start for the host to write into.
//
//go:wasmexport get_request_buffer
func getRequestBuffer(size uint32) uint32 {
	// Grow on demand, but hand back a fresh small buffer once traffic drops:
	// linear memory never shrinks, so one multi-megabyte payload would otherwise
	// raise the module's floor for its whole lifetime.
	if uint32(cap(reqBuf)) < size || (cap(reqBuf) > 1<<20 && uint32(cap(reqBuf)) > 4*size) {
		reqBuf = make([]byte, size)
	}
	reqBuf = reqBuf[:size]
	return bytesPtr(reqBuf)
}

// handle_request dispatches the request in the shared buffer: the first
// methodLen bytes are the method name, the next payloadLen bytes the JSON
// payload. The response is then available via response_ptr/response_len/
// response_is_binary.
//
//go:wasmexport handle_request
func handleRequest(methodLen, payloadLen uint32) (status uint32) {
	if inCall {
		return fail("re-entrant handle_request: a request is already in flight")
	}
	if session == nil {
		return fail("no session: create_session must be called first")
	}
	if !withinRequest(methodLen, payloadLen) {
		return fail("invalid request lengths: method + payload exceeds the request buffer")
	}
	inCall = true
	defer func() { inCall = false }()

	// A panic inside a handler would otherwise abort the runtime, which for a
	// reactor means every later request fails too.
	defer func() {
		if r := recover(); r != nil {
			status = fail(fmt.Sprintf("panic: %v\n%s", r, debug.Stack()))
		}
	}()

	// Drop the previous response before building the next one, so at most one
	// payload is pinned at a time.
	setResponse(nil, false)

	method := string(reqBuf[:methodLen])
	// The payload is copied rather than aliased: a handler may retain it, and
	// reqBuf is overwritten by the next get_request_buffer call.
	payload := make([]byte, payloadLen)
	copy(payload, reqBuf[methodLen:methodLen+payloadLen])

	result, err := session.HandleRequest(ctx, method, json.Value(payload))
	if err != nil {
		return fail(err.Error())
	}
	if raw, ok := result.(api.RawBinary); ok {
		setResponse([]byte(raw), true)
		return 0
	}
	encoded, err := json.Marshal(result)
	if err != nil {
		return fail(err.Error())
	}
	setResponse(encoded, false)
	return 0
}

// set_file writes a file into the in-memory file system: the first pathLen bytes
// of the request buffer are the path, the next contentLen bytes the contents.
// Pair it with an updateSnapshot fileChanges signal so the session re-reads.
//
//go:wasmexport set_file
func setFile(pathLen, contentLen uint32) uint32 {
	if inCall {
		return fail("re-entrant set_file: a request is already in flight")
	}
	if files == nil {
		return fail("no session: create_session must be called first")
	}
	if !withinRequest(pathLen, contentLen) {
		return fail("invalid set_file lengths: path + content exceeds the request buffer")
	}
	path := string(reqBuf[:pathLen])
	content := string(reqBuf[pathLen : pathLen+contentLen])
	if err := files.WriteFile(path, content); err != nil {
		return fail(err.Error())
	}
	setResponse(nil, false)
	return 0
}

// remove_file deletes a file from the in-memory file system; the first pathLen
// bytes of the request buffer are the path.
//
//go:wasmexport remove_file
func removeFile(pathLen uint32) uint32 {
	if inCall {
		return fail("re-entrant remove_file: a request is already in flight")
	}
	if files == nil {
		return fail("no session: create_session must be called first")
	}
	if !withinRequest(pathLen, 0) {
		return fail("invalid remove_file length: path exceeds the request buffer")
	}
	if err := files.Remove(string(reqBuf[:pathLen])); err != nil {
		return fail(err.Error())
	}
	setResponse(nil, false)
	return 0
}

//go:wasmexport response_ptr
func responsePtr() uint32 { return respPtr }

//go:wasmexport response_len
func responseLen() uint32 { return respLen }

//go:wasmexport response_is_binary
func responseIsBinary() uint32 { return respBinary }

// fail puts message in the response buffer and returns the error status, so a
// failing export reads as `return fail(...)`.
func fail(message string) uint32 {
	setResponse([]byte(message), false)
	return 1
}

func setResponse(data []byte, isBinary bool) {
	respBuf = data
	respPtr = bytesPtr(respBuf)
	respLen = uint32(len(respBuf))
	respBinary = 0
	if isBinary {
		respBinary = 1
	}
}

// withinRequest reports whether two lengths fit in the request buffer, without
// overflowing on the way to finding out.
func withinRequest(a, b uint32) bool {
	return a+b >= a && a+b <= uint32(len(reqBuf))
}

// readMem returns a view over length bytes of linear memory at ptr.
func readMem(ptr, length uint32) []byte {
	if length == 0 {
		return nil
	}
	return unsafe.Slice((*byte)(unsafe.Pointer(uintptr(ptr))), length)
}

// bytesPtr returns the linear-memory offset of b's backing array. The result is
// a bare address, which does not keep its referent alive — every slice handed
// to the host here is held in a package-level variable for exactly that reason.
func bytesPtr(b []byte) uint32 {
	if len(b) == 0 {
		return 0
	}
	return uint32(uintptr(unsafe.Pointer(&b[0])))
}
