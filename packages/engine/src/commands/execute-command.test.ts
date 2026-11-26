import { countBankItem, countInventoryItem } from "@runemark/domain";
import { describe, expect, it } from "vitest";
import {
  advanceTestGame,
  createTestGame,
  executeTestCommand,
  START,
  startTestActivity,
} from "../testing/game-fixtures";

describe("game commands", () => {
  it("rejects a valid activity at the wrong site", () => {
    expect(() => startTestActivity("test-forest", "mine-copper")).toThrow(
      /not available/,
    );
  });

  it("starts traveling before performing an activity", () => {
    const initial = createTestGame();
    const result = executeTestCommand(
      initial,
      {
        type: "START_ACTIVITY",
        nodeId: "test-forest",
        activityId: "chop-birch",
      },
      START,
    );
    expect(result.state.activeActivity?.phase).toBe("travel-to-activity");
    expect(result.state.character.nodeId).toBe("test-town");
    expect(result.summary.completedActions).toBe(0);
  });

  it("can stop during an unfinished banking operation", () => {
    const initial = startTestActivity("test-forest", "chop-birch");
    const banking = advanceTestGame(initial, START + 65_000);
    expect(banking.state.activeActivity?.phase).toBe("banking");
    const stopped = executeTestCommand(
      banking.state,
      { type: "STOP_ACTIVITY" },
      START + 70_000,
    );
    expect(stopped.state.activeActivity).toBeNull();
    expect(countBankItem(stopped.state.bank, "birch-log")).toBe(0);
    expect(
      countInventoryItem(stopped.state.character.backpack, "birch-log"),
    ).toBe(10);
  });
});
