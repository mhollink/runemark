import { countBankItem, countInventoryItem } from "@runemark/domain";
import { describe, expect, it } from "vitest";
import {
  advanceTestGame,
  createTestGame,
  START,
  startTestActivity,
} from "../testing/game-fixtures";
import { testContent } from "../testing/test-content";
import { BANKING_DURATION_MS } from "./config";

// Ten 5-second actions, two 5-second travel legs, and one bank operation.
const FULL_AT = 55_000;
const BANK_START = 60_000;
const CYCLE_MS = BANK_START + BANKING_DURATION_MS;

function startGathering() {
  return startTestActivity("test-forest", "chop-birch");
}

describe("automated banking", () => {
  it("starts traveling to the bank when the backpack fills", () => {
    const result = advanceTestGame(startGathering(), START + FULL_AT);
    expect(result.summary.completedActions).toBe(10);
    expect(result.summary.bankTrips).toBe(0);
    expect(result.state.activeActivity).toMatchObject({
      siteId: "test-forest",
      phase: "travel-to-bank",
      elapsedMs: 0,
      status: "running",
    });
    expect(countBankItem(result.state.bank, "birch-log")).toBe(0);
    expect(
      countInventoryItem(result.state.character.backpack, "birch-log"),
    ).toBe(10);
  });

  it("preserves partial travel and banking progress", () => {
    const first = advanceTestGame(startGathering(), START + FULL_AT + 2_000);
    expect(first.state.activeActivity).toMatchObject({
      phase: "travel-to-bank",
      elapsedMs: 2_000,
    });
    const second = advanceTestGame(first.state, START + BANK_START + 5_000);
    expect(second.state.activeActivity).toMatchObject({
      phase: "banking",
      elapsedMs: 5_000,
    });
    expect(countBankItem(second.state.bank, "birch-log")).toBe(0);
    expect(second.summary.bankTrips).toBe(0);
  });

  it("deposits resources and resumes gathering after returning to the site", () => {
    const result = advanceTestGame(startGathering(), START + CYCLE_MS + 10_000);
    expect(result.summary.completedActions).toBe(11);
    expect(result.summary.bankTrips).toBe(1);
    expect(result.summary.itemsBanked).toEqual({ "birch-log": 10 });
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

  it("includes travel and banking in repeated gathering cycles", () => {
    const result = advanceTestGame(
      startGathering(),
      START + 4 * CYCLE_MS + FULL_AT,
    );
    expect(result.summary.completedActions).toBe(50);
    expect(result.summary.bankTrips).toBe(4);
    expect(result.summary.experienceGained).toEqual({ woodcutting: 200 });
    expect(countBankItem(result.state.bank, "birch-log")).toBe(40);
    expect(
      countInventoryItem(result.state.character.backpack, "birch-log"),
    ).toBe(10);
    expect(result.state.activeActivity?.phase).toBe("travel-to-bank");
  });

  it("supports many banking cycles during offline simulation", () => {
    const result = advanceTestGame(startGathering(), START + 1_000 * CYCLE_MS);
    expect(result.summary.bankTrips).toBe(1_000);
    expect(result.summary.completedActions).toBe(10_000);
    expect(countBankItem(result.state.bank, "birch-log")).toBe(10_000);
    expect(
      countInventoryItem(result.state.character.backpack, "birch-log"),
    ).toBe(0);
    expect(result.state.activeActivity?.phase).toBe("travel-to-site");
    expect(result.events).toEqual([]);
  });

  it("produces identical states across offline simulation boundaries", () => {
    const initial = startTestActivity("test-mine", "mine-copper");
    const end = START + 86_400_000;
    const direct = advanceTestGame(initial, end);
    const first = advanceTestGame(initial, START + 21_000);
    const second = advanceTestGame(first.state, START + 75_000);
    const third = advanceTestGame(second.state, end);
    expect(third.state).toEqual(direct.state);
  });

  it("blocks when no bank is accessible", () => {
    const town = testContent.locations["test-town"];
    if (!town) throw new Error("Missing test town");
    const content = {
      ...testContent,
      locations: {
        ...testContent.locations,
        "test-town": { ...town, facilities: [] },
      },
    };
    const initial = startTestActivity(
      "test-forest",
      "chop-birch",
      createTestGame(content),
      content,
    );
    const result = advanceTestGame(initial, START + 86_400_000, content);
    expect(result.summary.completedActions).toBe(10);
    expect(result.summary.bankTrips).toBe(0);
    expect(result.state.activeActivity?.status).toBe("blocked");
    expect(result.events).toEqual([
      {
        type: "ACTIVITY_BLOCKED",
        siteId: "test-forest",
        activityId: "chop-birch",
        timestamp: START + FULL_AT,
        reason: "BANK_UNAVAILABLE",
      },
    ]);
  });

  it("restores health on a bank visit", () => {
    const initial = startGathering();
    const result = advanceTestGame(
      { ...initial, character: { ...initial.character, currentHitpoints: 2 } },
      START + CYCLE_MS,
    );
    expect(result.summary.bankTrips).toBe(1);
    expect(result.state.character.currentHitpoints).toBe(10);
  });
});
