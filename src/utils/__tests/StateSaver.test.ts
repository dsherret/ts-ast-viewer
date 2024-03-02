import { expect } from "@std/expect";
import { Theme, TreeMode } from "../../types/index.js";
import * as enumUtils from "../enumUtils.js";
import { StateSaver } from "../StateSaver.js";

function getLocalStorage() {
  let savedData: string | null = null;
  return {
    getItem(key: string) {
      if (key === StateSaver._stateKey) {
        return savedData;
      }
      return null;
    },
    setItem(key: string, value: string) {
      if (key === StateSaver._stateKey) {
        savedData = value;
      }
    },
  };
}

function setup() {
  const localStorage = getLocalStorage();
  const saver = new StateSaver(localStorage);
  return { saver, localStorage };
}

Deno.test("should get the default state when nothing set", () => {
  const { saver } = setup();
  expect(saver.get()).toEqual({
    version: 4,
    treeMode: TreeMode.forEachChild,
    showFactoryCode: true,
    showInternals: false,
    theme: Theme.OS,
  });
});

Deno.test("should get the state over sessions", () => {
  const localStorage = getLocalStorage();
  const saver1 = new StateSaver(localStorage);
  const state = saver1.get();
  state.treeMode = TreeMode.getChildren;
  saver1.set(state);

  const saver2 = new StateSaver(localStorage);
  expect(saver2.get()).toEqual({
    version: 4,
    treeMode: TreeMode.getChildren,
    showFactoryCode: true,
    showInternals: false,
    theme: Theme.OS,
  });
});

Deno.test("should get the state that was set", () => {
  const { saver } = setup();
  const state = saver.get();
  state.treeMode = TreeMode.getChildren;
  state.showFactoryCode = false;
  state.showInternals = true;
  saver.set(state);

  expect(saver.get()).toEqual({
    version: 4,
    treeMode: TreeMode.getChildren,
    showFactoryCode: false,
    showInternals: true,
    theme: Theme.OS,
  });
});

Deno.test("should work for every tree mode", () => {
  for (const treeMode of enumUtils.getValues<TreeMode>(TreeMode)) {
    const { saver } = setup();
    const state = saver.get();
    state.treeMode = treeMode;
    saver.set(state);

    expect(saver.get()).toEqual({
      version: 4,
      treeMode,
      showFactoryCode: true,
      showInternals: false,
      theme: Theme.OS,
    });
  }
});

Deno.test("should work for every theme", () => {
  for (const theme of [Theme.OS, Theme.Dark, Theme.Light]) {
    const { saver } = setup();
    const state = saver.get();
    state.theme = theme;
    saver.set(state);

    expect(saver.get()).toEqual({
      version: 4,
      treeMode: TreeMode.forEachChild,
      showFactoryCode: true,
      showInternals: false,
      theme,
    });
  }
});

Deno.test("should upgrade from version 1", () => {
  const { saver, localStorage } = setup();
  localStorage.setItem(
    StateSaver._stateKey,
    JSON.stringify({
      version: 1,
      treeMode: TreeMode.getChildren,
    }),
  );

  expect(saver.get()).toEqual({
    version: 4,
    treeMode: TreeMode.getChildren,
    showFactoryCode: true,
    showInternals: false,
    theme: Theme.OS,
  });
});

Deno.test("should upgrade from version 2", () => {
  const { saver, localStorage } = setup();
  localStorage.setItem(
    StateSaver._stateKey,
    JSON.stringify({
      version: 2,
      treeMode: TreeMode.getChildren,
      showFactoryCode: false,
      theme: Theme.OS,
    }),
  );

  expect(saver.get()).toEqual({
    version: 4,
    treeMode: TreeMode.getChildren,
    showFactoryCode: false,
    showInternals: false,
    theme: Theme.OS,
  });
});

Deno.test("should upgrade from version 3", () => {
  const { saver, localStorage } = setup();
  localStorage.setItem(
    StateSaver._stateKey,
    JSON.stringify({
      version: 3,
      treeMode: TreeMode.getChildren,
      showFactoryCode: false,
      showInternals: false,
    }),
  );

  expect(saver.get()).toEqual({
    version: 4,
    treeMode: TreeMode.getChildren,
    showFactoryCode: false,
    showInternals: false,
    theme: Theme.OS,
  });
});
