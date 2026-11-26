import { createInventory } from "@runemark/domain";
import { describe, expect, it } from "vitest";
import { testContent } from "../testing/test-content";
import { storeLoot, tryAddItems } from "./store-loot";

const drops = [
  { itemId: "birch-log", quantity: 1 },
  { itemId: "copper-ore", quantity: 1 },
];

describe("loot storage", () => {
  it("does not partially add an atomic batch", () => {
    const inventory = createInventory(1);
    expect(tryAddItems(inventory, testContent, drops)).toBeNull();
    expect(inventory.slots).toEqual([]);
  });

  it("stores accepted loot in order and skips overflow", () => {
    const inventory = createInventory(1);
    const result = storeLoot(inventory, testContent, drops);
    expect(result.accepted).toEqual([drops[0]]);
    expect(result.inventory.slots).toEqual([drops[0]]);
    expect(inventory.slots).toEqual([]);
  });

  it("can add to an existing stack even when no slots are free", () => {
    const inventory = createInventory(1);
    const first = storeLoot(inventory, testContent, [
      { itemId: "feather", quantity: 3 },
    ]);
    const second = storeLoot(first.inventory, testContent, [
      { itemId: "feather", quantity: 2 },
    ]);
    expect(second.inventory.slots).toEqual([
      { itemId: "feather", quantity: 5 },
    ]);
    expect(second.accepted).toEqual([{ itemId: "feather", quantity: 2 }]);
    expect(first.inventory.slots).toEqual([{ itemId: "feather", quantity: 3 }]);
  });
});
