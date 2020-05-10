import constants from "./constants";
import { CompilerPackageNames } from "../../src/compiler";
import { TreeMode } from "../../src/types";

let visited = false;
export function visitSite() {
    // this is a quick fix to speed up the tests
    if (visited)
        return;
    cy.visit(constants.siteUrl, {
        retryOnStatusCodeFailure: true,
        onLoad: () => {
            visited = true;
        },
        timeout: 30_000,
    });
}

export function setEditorText(text: string) {
    cy.window().then(win => {
        (win as any).setMonacoEditorText(text);
    });
    cy.get(`#${constants.css.mainCodeEditor.id} .view-lines`).click();
    cy.wait(constants.general.sourceFileRefreshDelay + 150);
}

export function setFactoryCodeEnabled(enabled: boolean) {
    cy.get(`#${constants.css.options.id}`).click();
    const checkbox = cy.get(`#${constants.css.options.showFactoryCodeId}`);
    enabled ? checkbox.check() : checkbox.uncheck();
    cy.get(`#${constants.css.options.id}`).click(); // hide
}

export function setShowInternals(enabled: boolean) {
    cy.get(`#${constants.css.options.id}`).click();
    const checkbox = cy.get(`#${constants.css.options.showInternalsId}`);
    enabled ? checkbox.check() : checkbox.uncheck();
    cy.get(`#${constants.css.options.id}`).click(); // hide
}

export function setBindingEnabled(enabled: boolean) {
    cy.get(`#${constants.css.options.id}`).click();
    const checkbox = cy.get(`#${constants.css.options.bindingEnabledId}`);
    enabled ? checkbox.check() : checkbox.uncheck();
    cy.get(`#${constants.css.options.id}`).click(); // hide
}

export function getFactoryCodeEditorText() {
    return cy.window().then(win => ((win as any).getFactoryCodeEditorText() as string).replace(/\r?\n/g, "\n"));
}

export function setVersion(packageName: CompilerPackageNames) {
    cy.get(`#${constants.css.options.id}`).click();
    cy.get(`#${constants.css.options.compilerVersionSelectionId}`).select(packageName);
    cy.get(`#${constants.css.options.id}`).click(); // hide
}

export function setTreeMode(treeMode: TreeMode) {
    cy.get(`#${constants.css.options.id}`).click();
    cy.get(`#${constants.css.options.treeModeId}`).select(treeMode.toString());
    cy.get(`#${constants.css.options.id}`).click(); // hide
}

export function selectNode(...selection: string[]) {
    const query = selection.map(n => `div[data-name='${n}']`).join(" ");
    cy.get(`#${constants.css.treeViewer.id} ${query} .nodeText`).first().click();
}

export function forAllCompilerVersions(action: (version: CompilerPackageNames) => void) {
    if (process.env.CI != null)
        action("typescript-next" as any);
    else {
        action("typescript");
        // todo: make testing everything configurable
        // for (const versionInfo of compilerVersionCollection)
        //     action(versionInfo.packageName);
    }
}

export interface State {
    treeView: TreeViewNode;
    node: Node;
    type?: Type | "none";
    symbol?: Symbol | "none";
    signature?: Signature | "none";
    factoryCode?: string;
}

export function checkState(state: State) {
    checkTreeView(state.treeView);
    checkNode(state.node);
    checkType(state.type);
    checkSymbol(state.symbol);
    checkSignature(state.signature);
    // checkFactoryCode(state.factoryCode); // todo: re-enable this in the future
}

export interface TreeViewNode {
    name: string;
    children?: TreeViewNode[];
    selected?: boolean;
}

export function checkTreeView(tree: TreeViewNode) {
    checkDescendants(tree.name, tree, () => cy.get(`#${constants.css.treeViewer.id}`).find(">div").first());

    function checkDescendants(name: string, node: TreeViewNode, getCurrentElement: () => Cypress.Chainable<JQuery<HTMLElement>>) {
        it(`should have correct text (${name})`, () => {
            getCurrentElement().find(".nodeText").first().should("have.text", node.name)
                .and(node.selected ? "have.class" : "not.have.class", constants.css.treeViewer.selectedNodeClass);
        });

        it(`should have same selected (${name})`, () => {
            getCurrentElement().find(".nodeText").first().should(node.selected ? "have.class" : "not.have.class", constants.css.treeViewer.selectedNodeClass);
        });

        if (node.children == null) {
            it(`should not have children (${name})`, () => {
                getCurrentElement().should("have.class", "endNode");
            });
        }
        else {
            it(`should have children (${name})`, () => {
                getCurrentElement().should("not.have.class", "endNode");
            });

            const getTreeViewChildrenElement = () => getCurrentElement().find(">.tree-view >.tree-view_children").first();
            it(`should have the correct amount of children (${name})`, () => {
                getTreeViewChildrenElement().children().should("have.length", node.children!.length);
            });

            for (let i = 0; i < node.children.length; i++)
                checkDescendants(name + ">" + node.children[i].name, node.children[i], () => getTreeViewChildrenElement().children().eq(i));
        }
    }
}

export interface Node {
    name?: string;
    pos?: number;
    end?: number;
    start?: number;
    isBound?: boolean;
    /** test internal property */
    haveScriptKindInternalProperty?: boolean;
}

export function checkNode(node: Node) {
    if (node.name != null) {
        it("should have the correct node name", () => {
            getMainElement().find(">.tree-view>.tree-view_item").first().should("have.text", node.name);
        });
    }

    if (node.pos != null) {
        it("should have the correct node pos", () => {
            getPropertyValueElement("pos").should("have.text", node.pos!.toString());
        });
    }

    if (node.end != null) {
        it("should have the correct node end", () => {
            getPropertyValueElement("end").should("have.text", node.end!.toString());
        });
    }

    if (node.start != null) {
        it("should have the correct node start", () => {
            getMethodValueElement("getStart").should("have.text", node.start!.toString());
        });
    }

    if (typeof node.isBound === "boolean") {
        it(`should${node.isBound ? " " : " not "}have a bound node`, () => {
            getContainerElement("id").should(node.isBound ? "exist" : "not.exist");
        });
    }
    if (node.haveScriptKindInternalProperty != null) {
        it("should have the script kind internal property", () => {
            getContainerElement("scriptKind").should(node.haveScriptKindInternalProperty ? "exist" : "not.exist");
        });
    }

    function getPropertyValueElement(name: string) {
        return getContainerElement(name).find(`.value`).first();
    }

    function getMethodValueElement(methodName: string) {
        return getContainerElement(methodName + "()").find(`.value`).first();
    }

    function getContainerElement(name: string) {
        return getMainElement().find(`>.tree-view>.tree-view_children>[data-name='${name}']`);
    }

    function getMainElement() {
        return cy.get(`#${constants.css.properties.node.id}`);
    }
}

export interface Type {
    name: string;
}

export function checkType(type: Type | "none" | undefined) {
    if (type == null) {
        it("should not display the type", () => {
            getMainElement().should("not.exist");
        });
        return;
    }
    else if (type === "none") {
        it("should have a [None] type", () => {
            getMainElement().should("have.text", "[None]");
        });
        return;
    }

    it("should have the correct type name", () => {
        getMainElement().find(">.tree-view>.tree-view_item").first().should("have.text", type.name);
    });

    function getMainElement() {
        return cy.get(`#${constants.css.properties.type.id}`);
    }
}

export interface Symbol {
    name: string;
}

export function checkSymbol(symbol: Symbol | "none" | undefined) {
    if (symbol == null) {
        it("should not display the symbol", () => {
            getMainElement().should("not.exist");
        });
        return;
    }
    else if (symbol === "none") {
        it("should have a [None] symbol", () => {
            getMainElement().should("have.text", "[None]");
        });
        return;
    }

    it("should have the correct symbol name", () => {
        getMainElement().find(">.tree-view>.tree-view_item").first().should("have.text", symbol.name);
    });

    function getMainElement() {
        return cy.get(`#${constants.css.properties.symbol.id}`);
    }
}

export interface Signature {
    minArgumentCount: number;
}

export function checkSignature(signature: Signature | "none" | undefined) {
    if (signature == null) {
        it("should not display the signature", () => {
            getMainElement().should("not.exist");
        });
        return;
    }
    else if (signature === "none") {
        it("should have a [None] signature", () => {
            getMainElement().should("have.text", "[None]");
        });
        return;
    }

    it("should have the correct signature min argument count", () => {
        getPropertyValueElement("minArgumentCount").should("have.text", signature.minArgumentCount.toString());
    });

    function getPropertyValueElement(name: string) {
        return getMainElement().find(`>.tree-view>.tree-view_children>[data-name='${name}'] .value`).first();
    }

    function getMainElement() {
        return cy.get(`#${constants.css.properties.signature.id}`);
    }
}

export function checkFactoryCode(expectedCode: string | undefined) {
    if (expectedCode == null) {
        it("should not have the factory code open", () => {
            getMainElement().should("not.exist");
        });
    }
    else {
        it("should have the factory code open", () => {
            getMainElement().should("exist");
        });

        it("should have the correct text", () => {
            getFactoryCodeEditorText().should("equal", expectedCode);
        });
    }

    function getMainElement() {
        return cy.get(`#${constants.css.factoryCodeEditor.id}`);
    }
}
