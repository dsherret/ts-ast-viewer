export function assertNever(_value: never, message: string): never {
  throw new Error(message);
}
