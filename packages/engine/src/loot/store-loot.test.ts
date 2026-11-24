import { gameContent } from "@runemark/content";
import { createInventory } from "@runemark/domain";
import { describe, expect, it } from "vitest";
import { storeLoot, tryAddItems } from "./store-loot";

const drops = [
  { itemId: "birch-log", quantity: 1 },
  { itemId: "copper-ore", quantity: 1 },
];

describe("loot storage", () => {
  it("does not partially add an atomic batch", () => {
    const inventory = createInventory(1);
    expect(tryAddItems(inventory, gameContent, drops)).toBeNull();
    expect(inventory.slots).toEqual([]);
  });

  it("stores accepted loot in order and skips overflow", () => {
    const inventory = createInventory(1);
    const result = storeLoot(inventory, gameContent, drops);
    expect(result.accepted).toEqual([drops[0]]);
    expect(result.inventory.slots).toEqual([drops[0]]);
    expect(inventory.slots).toEqual([]);
  });
});
