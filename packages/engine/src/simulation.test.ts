import { countBankItem, countInventoryItem } from "@runemark/domain";
import { describe, expect, it } from "vitest";
import { BANKING_DURATION_MS } from "./logistics/config";
import {
  advanceTestGame,
  START,
  startTestActivity,
} from "./testing/game-fixtures";

describe("simulation", () => {
  it("runs a deterministic gathering and banking cycle without mutation", () => {
    const initial = startTestActivity("test-forest", "chop-birch");
    const snapshot = JSON.stringify(initial);
    freezeRecursively(initial);
    const end = START + 70_000 + BANKING_DURATION_MS;
    const direct = advanceTestGame(initial, end);
    const first = advanceTestGame(initial, START + 12_000);
    const second = advanceTestGame(first.state, START + 57_000);
    const third = advanceTestGame(second.state, end);
    expect(third.state).toEqual(direct.state);
    expect(JSON.stringify(initial)).toBe(snapshot);
    expect(direct.summary.completedActions).toBe(11);
    expect(direct.summary.bankTrips).toBe(1);
    expect(countBankItem(direct.state.bank, "birch-log")).toBe(10);
    expect(
      countInventoryItem(direct.state.character.backpack, "birch-log"),
    ).toBe(1);
  });
});

function freezeRecursively(value: unknown): void {
  if (typeof value !== "object" || value === null || Object.isFrozen(value))
    return;
  for (const child of Object.values(value)) freezeRecursively(child);
  Object.freeze(value);
}
