import { type GameContent, gameContent } from "@runemark/content";
import {
  countInventoryItem,
  createCharacter,
  createGameSave,
  createInventory,
  experienceForSkill,
  type GameSave,
} from "@runemark/domain";
import { describe, expect, it } from "vitest";
import { advanceGame, executeCommand } from "./index";
import { simulateGame } from "./simulation";

const START = 1_790_000_000_000;

function newGame(): GameSave {
  return createGameSave({
    id: "test-save",
    contentVersion: gameContent.version,
    lastSimulatedAt: START,
    randomState: 42,
    character: createCharacter({
      id: "test-character",
      name: "Eira",
      locationId: "eldvik",
      startingHitpoints: 10,
    }),
  });
}

function startGathering(siteId = "eldvik-birch-grove"): GameSave {
  return executeCommand(newGame(), { type: "START_ACTIVITY", siteId }, START)
    .state;
}

describe("gathering engine", () => {
  it("preserves unfinished actions", () => {
    const initial = startGathering();

    const first = advanceGame(initial, START + 3_000);
    expect(first.summary.completedActions).toBe(0);
    expect(first.state.activeActivity?.elapsedMs).toBe(3_000);

    const second = advanceGame(first.state, START + 12_000);

    expect(second.summary.completedActions).toBe(2);
    expect(second.state.activeActivity?.elapsedMs).toBe(2_000);
    expect(second.summary.itemsGained).toEqual({
      "birch-log": 2,
    });
  });

  it("produces identical state regardless of simulation chunks", () => {
    const initial = startGathering("eldvik-copper-mine");

    const direct = advanceGame(initial, START + 60_000);

    const first = advanceGame(initial, START + 13_000);
    const second = advanceGame(first.state, START + 31_000);
    const third = advanceGame(second.state, START + 60_000);

    expect(third.state).toEqual(direct.state);
  });

  it("blocks when no guaranteed resource can fit", () => {
    const initial = startGathering();

    const result = advanceGame(initial, START + 86_400_000);

    expect(result.state.activeActivity?.status).toBe("blocked");
    expect(result.summary.completedActions).toBe(10);
    expect(result.events[0]?.timestamp).toBe(START + 50_000);

    expect(
      countInventoryItem(result.state.character.backpack, "birch-log"),
    ).toBe(10);
  });

  it("discards overflowing loot but still awards XP", () => {
    const mining = gameContent.activities["mine-copper"];
    if (!mining) throw new Error("Missing mining activity");

    const content: GameContent = {
      ...gameContent,
      activities: {
        ...gameContent.activities,
        "mine-copper": {
          ...mining,
          rewards: {
            kind: "all",
            rewards: [
              {
                kind: "conditional",
                oneIn: 1,
                success: {
                  kind: "fixed",
                  drops: [{ itemId: "uncut-ruby", quantity: 1 }],
                },
                failure: { kind: "nothing" },
              },
              {
                kind: "fixed",
                drops: [{ itemId: "copper-ore", quantity: 1 }],
              },
            ],
          },
        },
      },
    };

    const base = newGame();

    const state: GameSave = {
      ...base,
      character: {
        ...base.character,
        backpack: createInventory(1),
      },
      activeActivity: {
        siteId: "eldvik-copper-mine",
        elapsedMs: 0,
        status: "running",
      },
    };

    const result = simulateGame(state, content, START + 7_000);

    expect(result.summary.completedActions).toBe(1);
    expect(result.summary.itemsGained).toEqual({
      "uncut-ruby": 1,
    });

    expect(
      countInventoryItem(result.state.character.backpack, "uncut-ruby"),
    ).toBe(1);

    expect(
      countInventoryItem(result.state.character.backpack, "copper-ore"),
    ).toBe(0);

    expect(experienceForSkill(result.state.character.skills, "mining")).toBe(7);

    expect(result.state.activeActivity?.status).toBe("blocked");
    expect(result.state.randomState).not.toBe(state.randomState);
  });

  it("does not train when no resources can fit initially", () => {
    const started = startGathering();

    const state: GameSave = {
      ...started,
      character: {
        ...started.character,
        backpack: createInventory(0),
      },
    };

    const result = advanceGame(state, START + 60_000);

    expect(result.summary.completedActions).toBe(0);
    expect(result.state.activeActivity?.status).toBe("blocked");
    expect(result.state.randomState).toBe(state.randomState);
  });
});
