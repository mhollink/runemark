import { type GameContent, gameContent } from "@runemark/content";
import {
  countBankItem,
  countInventoryItem,
  createCharacter,
  createGameSave,
  createInventory,
  experienceForSkill,
  type GameSave,
  type GatheringActivityDefinition,
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
      skills: [],
    }),
  });
}

function startGathering(
  siteId = "eldvik-birch-grove",
  activityId = "chop-birch",
): GameSave {
  return executeCommand(
    newGame(),
    { type: "START_ACTIVITY", siteId, activityId },
    START,
  ).state;
}

describe("gathering engine", () => {
  it("preserves unfinished actions", () => {
    const initial = startGathering();

    const first = advanceGame(initial, START + 40_000);
    expect(first.summary.completedActions).toBe(1);
    expect(first.state.activeActivity?.elapsedMs).toBe(0);

    const second = advanceGame(first.state, START + 52_000);

    expect(second.summary.completedActions).toBe(2);
    expect(second.state.activeActivity?.elapsedMs).toBe(2_000);
    expect(second.summary.itemsGained).toEqual({
      "birch-log": 2,
    });
  });

  it("produces identical state regardless of simulation chunks", () => {
    const initial = startGathering("eldvik-copper-mine", "mine-copper");

    const direct = advanceGame(initial, START + 60_000);

    const first = advanceGame(initial, START + 13_000);
    const second = advanceGame(first.state, START + 31_000);
    const third = advanceGame(second.state, START + 60_000);

    expect(third.state).toEqual(direct.state);
  });

  it("automatically moves items from inventory to bank", () => {
    const initial = startGathering();

    const result = advanceGame(initial, START + 666_000);

    expect(result.state.activeActivity?.status).toBe("running");
    expect(result.state.activeActivity?.phase).toBe("travel-to-bank");
    expect(result.summary.completedActions).toBe(50);
    expect(result.summary.bankTrips).toBe(4);
    expect(result.summary.experienceGained).toEqual({
      woodcutting: 200,
    });
    expect(countBankItem(result.state.bank, "birch-log")).toBe(40);

    expect(
      countInventoryItem(result.state.character.backpack, "birch-log"),
    ).toBe(10);
  });

  it("discards overflowing loot but still awards XP", () => {
    const mining = gameContent.activities[
      "mine-copper"
    ] as GatheringActivityDefinition;
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
        nodeId: "eldvik-copper-mine",
        backpack: createInventory(1),
      },
      activeActivity: {
        siteId: "eldvik-copper-mine",
        activityId: "mine-copper",
        elapsedMs: 0,
        status: "running",
        phase: "working",
        travel: null,
      },
    };

    const result = simulateGame(state, content, START + 7_500);

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

    expect(experienceForSkill(result.state.character.skills, "mining")).toBe(6);

    expect(result.state.activeActivity?.status).toBe("running");
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

describe("automated banking", () => {
  it("starts banking when the backpack fills", () => {
    const started = startGathering();

    const result = advanceGame(started, START + 120_000);

    expect(result.summary.completedActions).toBe(10);
    expect(result.summary.bankTrips).toBe(0);

    expect(result.state.activeActivity).toMatchObject({
      siteId: "eldvik-birch-grove",
      phase: "banking",
      elapsedMs: 0,
      status: "running",
    });

    expect(countBankItem(result.state.bank, "birch-log")).toBe(0);
    expect(
      countInventoryItem(result.state.character.backpack, "birch-log"),
    ).toBe(10);
  });

  it("preserves partial banking progress", () => {
    const started = startGathering();

    const first = advanceGame(started, START + 50_000);
    const second = advanceGame(first.state, START + 90_000);

    expect(second.state.activeActivity).toMatchObject({
      phase: "travel-to-bank",
      elapsedMs: 5000,
    });

    expect(countBankItem(second.state.bank, "birch-log")).toBe(0);
    expect(second.summary.bankTrips).toBe(0);
  });

  it("deposits resources after 60 seconds and resumes gathering", () => {
    const started = startGathering();

    const result = advanceGame(started, START + 180_000);

    expect(result.summary.completedActions).toBe(11);
    expect(result.summary.bankTrips).toBe(1);
    expect(result.summary.itemsBanked).toEqual({
      "birch-log": 10,
    });

    expect(countBankItem(result.state.bank, "birch-log")).toBe(10);

    expect(
      countInventoryItem(result.state.character.backpack, "birch-log"),
    ).toBe(1);

    expect(result.state.activeActivity).toMatchObject({
      phase: "working",
      elapsedMs: 0,
      status: "running",
    });
  });

  it("produces identical states across simulation boundaries", () => {
    const started = startGathering("eldvik-copper-mine", "mine-copper");
    const end = START + 86_400_000;

    const direct = advanceGame(started, end);

    const first = advanceGame(started, START + 21_000);
    const second = advanceGame(first.state, START + 75_000);
    const third = advanceGame(second.state, end);

    expect(third.state).toEqual(direct.state);
  });

  it("supports many banking cycles during offline simulation", () => {
    const started = startGathering();

    const result = advanceGame(started, START + 86_400_000);

    expect(result.summary.bankTrips).toBe(617);
    expect(result.summary.completedActions).toBe(6_170);

    expect(countBankItem(result.state.bank, "birch-log")).toBe(6_170);

    expect(
      countInventoryItem(result.state.character.backpack, "birch-log"),
    ).toBe(0);

    expect(result.state.activeActivity?.phase).toBe("travel-to-site");
    expect(result.events).toEqual([]);
  });

  it("can stop gathering during an unfinished banking operation", () => {
    const started = startGathering();

    const banking = advanceGame(started, START + 70_000);

    const stopped = executeCommand(
      banking.state,
      { type: "STOP_ACTIVITY" },
      START + 75_000,
    );

    expect(stopped.state.activeActivity).toBeNull();
    expect(countBankItem(stopped.state.bank, "birch-log")).toBe(0);

    expect(
      countInventoryItem(stopped.state.character.backpack, "birch-log"),
    ).toBe(8);
  });

  it("blocks when the location has no accessible bank", () => {
    const location = gameContent.locations.eldvik;
    if (!location) throw new Error("Missing Eldvik location");

    const content: GameContent = {
      ...gameContent,
      locations: {
        ...gameContent.locations,
        eldvik: {
          ...location,
          facilities: [],
        },
      },
    };

    const started = startGathering();
    const result = simulateGame(started, content, START + 86_400_000);

    expect(result.summary.completedActions).toBe(10);
    expect(result.summary.bankTrips).toBe(0);
    expect(result.state.activeActivity?.status).toBe("blocked");
    expect(result.events).toEqual([
      {
        type: "ACTIVITY_BLOCKED",
        siteId: "eldvik-birch-grove",
        activityId: "chop-birch",
        timestamp: START + 85_000,
        reason: "BANK_UNAVAILABLE",
      },
    ]);
  });

  it("travels to the selected site before gathering", () => {
    const started = startGathering();

    expect(started.activeActivity?.phase).toBe("travel-to-site");

    const result = advanceGame(started, START + 40_000);

    expect(result.summary.completedActions).toBe(1);
    expect(result.state.character.nodeId).toBe("eldvik-birch-grove");
    expect(result.state.activeActivity?.phase).toBe("working");
  });

  it("includes travel in automatic banking cycles", () => {
    const started = startGathering();
    const result = advanceGame(started, START + 665_000);

    expect(result.summary.bankTrips).toBe(4);
    expect(result.summary.completedActions).toBe(50);
    expect(countBankItem(result.state.bank, "birch-log")).toBe(40);
    expect(
      countInventoryItem(result.state.character.backpack, "birch-log"),
    ).toBe(10);
  });

  it("is deterministic across travel and banking", () => {
    const started = startGathering();

    const direct = advanceGame(started, START + 665_000);
    const first = advanceGame(started, START + 12_000);
    const second = advanceGame(first.state, START + 75_000);
    const third = advanceGame(second.state, START + 665_000);

    expect(third.state).toEqual(direct.state);
  });
});

describe("fishing", () => {
  it("catches fish and banks a full backpack", () => {
    const initial = startGathering("eldvik-shore", "catch-herring");

    const first = advanceGame(initial, START + 38_000);

    expect(first.summary.itemsGained).toEqual({
      "raw-herring": 1,
    });
    expect(first.summary.experienceGained).toEqual({
      fishing: 8,
    });

    const result = advanceGame(initial, START + 160_000);

    expect(result.summary.completedActions).toBe(10);
    expect(result.summary.bankTrips).toBe(1);
    expect(countBankItem(result.state.bank, "raw-herring")).toBe(10);
    expect(result.state.activeActivity?.status).toBe("running");
  });
});
