import { describe, expect, it } from "vitest";
import { testContent } from "@/test/fixtures/test-content";
import { createTestGame } from "@/test/fixtures/test-game";
import { isGameSave } from "./save-validation";

describe("Save validation", () => {
  it("accepts a valid game save", () => {
    expect(isGameSave(createTestGame(), testContent)).toBe(true);
  });

  it.each([null, undefined, [], {}, "invalid", 42])(
    "rejects malformed save %s",
    (value) => {
      expect(isGameSave(value, testContent)).toBe(false);
    },
  );

  it("rejects an incompatible schema version", () => {
    const game = {
      ...createTestGame(),
      schemaVersion: 999,
    };

    expect(isGameSave(game, testContent)).toBe(false);
  });

  it("rejects an incompatible content version", () => {
    const game = {
      ...createTestGame(),
      contentVersion: "unknown-version",
    };

    expect(isGameSave(game, testContent)).toBe(false);
  });

  it.each([-1, 0.5, NaN, Infinity])(
    "rejects invalid currency balance %s",
    (coins) => {
      const game = createTestGame();

      const invalid = {
        ...game,
        character: {
          ...game.character,
          coins,
        },
      };

      expect(isGameSave(invalid, testContent)).toBe(false);
    },
  );

  it("rejects an unknown world node", () => {
    const game = createTestGame();

    const invalid = {
      ...game,
      character: {
        ...game.character,
        nodeId: "unknown-node",
      },
    };

    expect(isGameSave(invalid, testContent)).toBe(false);
  });

  it("rejects an unknown item", () => {
    const game = {
      ...createTestGame(),
      bank: {
        items: {
          "unknown-item": 10,
        },
      },
    };

    expect(isGameSave(game, testContent)).toBe(false);
  });

  it("rejects a backpack exceeding its capacity", () => {
    const game = createTestGame();

    const invalid = {
      ...game,
      character: {
        ...game.character,
        backpack: {
          capacity: 0,
          slots: [
            {
              itemId: "copper-ore",
              quantity: 1,
            },
          ],
        },
      },
    };

    expect(isGameSave(invalid, testContent)).toBe(false);
  });

  it("rejects stacked non-stackable items", () => {
    const game = createTestGame();

    const invalid = {
      ...game,
      character: {
        ...game.character,
        backpack: {
          capacity: 16,
          slots: [
            {
              itemId: "copper-ore",
              quantity: 2,
            },
          ],
        },
      },
    };

    expect(isGameSave(invalid, testContent)).toBe(false);
  });
});
