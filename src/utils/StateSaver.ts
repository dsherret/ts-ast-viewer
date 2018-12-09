import { TreeMode } from "../types";

export interface SavedState {
    version: number;
    treeMode: TreeMode;
}

export interface LocalStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}

export class StateSaver {
    static _stateKey = "tsSimpleAst_savedState";
    private _cachedState: SavedState | undefined = undefined;

    constructor(private readonly localStorage: LocalStorage = window.localStorage) {
    }

    private get defaultState() {
        return {
            version: 1,
            treeMode: TreeMode.forEachChild
        };
    }

    get() {
        if (this._cachedState != null)
            return this._cachedState;

        try {
            const text = this.localStorage.getItem(StateSaver._stateKey);
            if (text != null) {
                const data = JSON.parse(text) || this.defaultState;
                if (this.verifyData(data))
                    return data;
            }
        } catch (err) {
            console.error("Problem getting state: " + err);
        }

        return this.defaultState;
    }

    set(sessionState: SavedState) {
        try {
            if (!this.verifyData(sessionState))
                return;

            this.localStorage.setItem(StateSaver._stateKey, JSON.stringify(sessionState));
            this._cachedState = sessionState;
        } catch (err) {
            console.error("Problem saving state: " + err);
        }
    }

    private verifyData(data: SavedState): data is SavedState {
        // better to have some schema transforms in the future, but for now it's simple
        if (data.version !== 1)
            return false;
        if (data.treeMode !== TreeMode.forEachChild && data.treeMode !== TreeMode.getChildren)
            return false;
        return true;
    }
}