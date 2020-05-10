import { TreeMode } from "../../types";
import { EnumUtils } from "../EnumUtils";
import { StateSaver } from "../StateSaver";

describe("StateSaver", () => {
    function getLocalStorage() {
        let savedData: string | null = null;
        return {
            getItem(key: string) {
                if (key === StateSaver._stateKey)
                    return savedData;
                return null;
            },
            setItem(key: string, value: string) {
                if (key === StateSaver._stateKey)
                    savedData = value;
            },
        };
    }

    function setup() {
        const localStorage = getLocalStorage();
        const saver = new StateSaver(localStorage);
        return { saver, localStorage };
    }

    it("should get the default state when nothing set", () => {
        const { saver } = setup();
        expect(saver.get()).toEqual({
            version: 3,
            treeMode: TreeMode.forEachChild,
            showFactoryCode: true,
            showInternals: false,
        });
    });

    it("should get the state over sessions", () => {
        const localStorage = getLocalStorage();
        const saver1 = new StateSaver(localStorage);
        const state = saver1.get();
        state.treeMode = TreeMode.getChildren;
        saver1.set(state);

        const saver2 = new StateSaver(localStorage);
        expect(saver2.get()).toEqual({
            version: 3,
            treeMode: TreeMode.getChildren,
            showFactoryCode: true,
            showInternals: false,
        });
    });

    it("should get the state that was set", () => {
        const { saver } = setup();
        const state = saver.get();
        state.treeMode = TreeMode.getChildren;
        state.showFactoryCode = false;
        state.showInternals = true;
        saver.set(state);

        expect(saver.get()).toEqual({
            version: 3,
            treeMode: TreeMode.getChildren,
            showFactoryCode: false,
            showInternals: true,
        });
    });

    it("should work for every tree mode", () => {
        for (const treeMode of EnumUtils.getValues<TreeMode>(TreeMode)) {
            const { saver } = setup();
            const state = saver.get();
            state.treeMode = treeMode;
            saver.set(state);

            expect(saver.get()).toEqual({
                version: 3,
                treeMode,
                showFactoryCode: true,
                showInternals: false,
            });
        }
    });

    it("should upgrade from version 1", () => {
        const { saver, localStorage } = setup();
        localStorage.setItem(StateSaver._stateKey, JSON.stringify({
            version: 1,
            treeMode: TreeMode.getChildren,
        }));

        expect(saver.get()).toEqual({
            version: 3,
            treeMode: TreeMode.getChildren,
            showFactoryCode: true,
            showInternals: false,
        });
    });

    it("should upgrade from version 2", () => {
        const { saver, localStorage } = setup();
        localStorage.setItem(StateSaver._stateKey, JSON.stringify({
            version: 2,
            treeMode: TreeMode.getChildren,
            showFactoryCode: false,
        }));

        expect(saver.get()).toEqual({
            version: 3,
            treeMode: TreeMode.getChildren,
            showFactoryCode: false,
            showInternals: false,
        });
    });
});
