import { Theme, TreeMode } from "../types/index.js";

export interface VersionedState {
  version: 1 | 2 | 3 | 4;
}

export interface SavedState extends VersionedState {
  treeMode: TreeMode;
  showFactoryCode: boolean;
  showInternals: boolean;
  theme: Theme;
}

export interface LocalStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export class StateSaver {
  static _stateKey = "tsSimpleAst_savedState"; // accidentally used name... oh well..
  private _cachedState: SavedState | undefined = undefined;

  constructor(private readonly localStorage: LocalStorage = globalThis.localStorage) {
  }

  private get defaultState(): SavedState {
    return {
      version: 4 as const,
      treeMode: TreeMode.forEachChild,
      showFactoryCode: true,
      showInternals: false,
      theme: Theme.OS,
    };
  }

  get() {
    if (this._cachedState != null) {
      return this._cachedState;
    }

    try {
      const text = this.localStorage.getItem(StateSaver._stateKey);
      if (text != null) {
        const data = transform(JSON.parse(text) || this.defaultState);
        if (this.verifyData(data)) {
          return data;
        }
      }
    } catch (err) {
      console.error("Problem getting state: " + err);
    }

    return this.defaultState;
  }

  set(sessionState: SavedState) {
    try {
      if (!this.verifyData(sessionState)) {
        return;
      }

      this.localStorage.setItem(
        StateSaver._stateKey,
        JSON.stringify(sessionState),
      );
      this._cachedState = sessionState;
    } catch (err) {
      console.error("Problem saving state: " + err);
    }
  }

  private verifyData(data: SavedState): data is SavedState {
    // better to have some schema transforms in the future, but for now it's simple
    if (data.version !== 4) {
      return false;
    }
    if (
      data.treeMode !== TreeMode.forEachChild &&
      data.treeMode !== TreeMode.getChildren
    ) {
      return false;
    }
    if (typeof data.showFactoryCode !== "boolean") {
      return false;
    }
    if (typeof data.showInternals !== "boolean") {
      return false;
    }
    if (![Theme.OS, Theme.Dark, Theme.Light].includes(data.theme)) {
      return false;
    }
    return true;
  }
}

// todo: better transformations

function transform(data: SavedState) {
  transformToVersion2(data);
  transformToVersion3(data);
  transformToVersion4(data);
  return data;
}

function transformToVersion2(data: VersionedState) {
  if (data.version !== 1) {
    return;
  }
  (data as any).showFactoryCode = true;
  data.version = 2;
}

function transformToVersion3(data: VersionedState) {
  if (data.version !== 2) {
    return;
  }
  (data as any).showInternals = false;
  data.version = 3;
}

function transformToVersion4(data: VersionedState) {
  if (data.version !== 3) {
    return;
  }
  (data as any).theme = Theme.OS;
  data.version = 4;
}
