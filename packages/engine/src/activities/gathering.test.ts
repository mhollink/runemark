import {
  countInventoryItem,
  createInventory,
  experienceForSkill,
} from "@runemark/domain";
import { describe, expect, it } from "vitest";
import { BANKING_DURATION_MS } from "../logistics/config";
import {
  advanceTestGame,
  createTestGame,
  START,
  startTestActivity,
} from "../testing/game-fixtures";
import { mineCopper, testContent } from "../testing/test-content";

describe("gathering activity", () => {
  it("preserves unfinished actions", () => {
    const initial = startTestActivity("test-forest", "chop-birch");
    const first = advanceTestGame(initial, START + 12_000);
    expect(first.summary.completedActions).toBe(1);
    expect(first.state.activeActivity?.elapsedMs).toBe(2_000);

    const second = advanceTestGame(first.state, START + 22_000);
    expect(second.summary.completedActions).toBe(2);
    expect(second.state.activeActivity?.elapsedMs).toBe(2_000);
    expect(second.summary.itemsGained).toEqual({ "birch-log": 2 });
  });

  it("produces identical state regardless of simulation chunks", () => {
    const initial = startTestActivity("test-mine", "mine-copper");
    const direct = advanceTestGame(initial, START + 60_000);
    const first = advanceTestGame(initial, START + 13_000);
    const second = advanceTestGame(first.state, START + 31_000);
    const third = advanceTestGame(second.state, START + 60_000);
    expect(third.state).toEqual(direct.state);
    expect(direct.state.randomState).not.toBe(initial.randomState);
  });

  it("discards overflowing loot but still awards XP", () => {
    const content = {
      ...testContent,
      lootTables: {
        ...testContent.lootTables,
        "test-gems": {
          id: "test-gems",
          kind: "conditional" as const,
          oneIn: 1,
          success: {
            kind: "fixed" as const,
            drops: [{ itemId: "uncut-ruby", quantity: 1 }],
          },
          failure: { kind: "nothing" as const },
        },
      },
    };
    const base = createTestGame(content);
    const state = startTestActivity(
      "test-mine",
      "mine-copper",
      {
        ...base,
        character: { ...base.character, backpack: createInventory(1) },
      },
      content,
    );
    const result = advanceTestGame(
      state,
      START + 15_000 + mineCopper.durationMs,
      content,
    );
    expect(result.summary.completedActions).toBe(1);
    expect(result.summary.itemsGained).toEqual({ "uncut-ruby": 1 });
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
    const base = createTestGame();
    const initial = startTestActivity("test-forest", "chop-birch", {
      ...base,
      character: { ...base.character, backpack: createInventory(0) },
    });
    const result = advanceTestGame(initial, START + 60_000);
    expect(result.summary.completedActions).toBe(0);
    expect(result.state.activeActivity?.status).toBe("blocked");
    expect(result.events.at(-1)?.reason).toBe("INVENTORY_FULL");
    expect(result.state.randomState).toBe(initial.randomState);
  });

  it("awards fishing loot and XP and banks a full backpack", () => {
    const initial = startTestActivity("test-shore", "catch-herring");
    const first = advanceTestGame(initial, START + 18_000);
    expect(first.summary.itemsGained).toEqual({ "raw-herring": 1 });
    expect(first.summary.experienceGained).toEqual({ fishing: 8 });
    const result = advanceTestGame(
      initial,
      START + 116_000 + BANKING_DURATION_MS,
    );
    expect(result.summary.completedActions).toBe(10);
    expect(result.summary.bankTrips).toBe(1);
    expect(result.state.bank.items["raw-herring"]).toBe(10);
    expect(result.state.activeActivity?.status).toBe("running");
  });
});
