import { countBankItem, countInventoryItem } from "@runemark/domain";
import { describe, expect, it } from "vitest";
import { BANKING_DURATION_MS } from "../logistics/config";
import {
  advanceTestGame,
  createTestGame,
  executeTestCommand,
  START,
} from "../testing/game-fixtures";

function startCooking(quantity: number) {
  const initial = {
    ...createTestGame(),
    bank: { items: { "raw-herring": quantity } },
  };
  return executeTestCommand(
    initial,
    {
      type: "START_ACTIVITY",
      siteId: "test-hearth",
      activityId: "cook-herring",
    },
    START,
  ).state;
}

describe("production", () => {
  it("starts by withdrawing ingredients", () => {
    expect(startCooking(5).activeActivity).toMatchObject({
      phase: "banking",
      elapsedMs: 0,
    });
  });

  it("processes available ingredients and banks outputs", () => {
    const result = advanceTestGame(startCooking(25), START + 3_600_000);
    expect(result.summary.completedActions).toBe(25);
    expect(result.summary.bankTrips).toBe(4);
    expect(result.summary.itemsConsumed).toEqual({ "raw-herring": 25 });
    expect(result.summary.itemsGained).toEqual({ "cooked-herring": 25 });
    expect(countBankItem(result.state.bank, "cooked-herring")).toBe(25);
    expect(countBankItem(result.state.bank, "raw-herring")).toBe(0);
    expect(result.state.activeActivity?.status).toBe("blocked");
    expect(result.events.at(-1)?.reason).toBe("INSUFFICIENT_MATERIALS");
  });

  it("does not consume ingredients before a recipe finishes", () => {
    const result = advanceTestGame(
      startCooking(5),
      START + BANKING_DURATION_MS + 5_000,
    );
    expect(result.summary.completedActions).toBe(0);
    expect(
      countInventoryItem(result.state.character.backpack, "raw-herring"),
    ).toBe(5);
  });

  it("produces identical state across simulation boundaries", () => {
    const initial = startCooking(25);
    const direct = advanceTestGame(initial, START + 3_600_000);
    const first = advanceTestGame(initial, START + BANKING_DURATION_MS + 5_000);
    const second = advanceTestGame(first.state, START + 95_000);
    const third = advanceTestGame(second.state, START + 3_600_000);
    expect(third.state).toEqual(direct.state);
  });
});
