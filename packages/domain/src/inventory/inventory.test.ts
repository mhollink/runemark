import { describe, expect, it } from "vitest";
import type { ItemDefinition } from "../items/item-definition";
import {
  addInventoryItem,
  availableInventorySlots,
  countInventoryItem,
  createInventory,
  InsufficientItemsError,
  InventoryCapacityError,
  removeInventoryItem,
  usedInventorySlots,
} from "./inventory";

const ore: ItemDefinition = {
  id: "copper-ore",
  name: "Copper ore",
  stackable: true,
};
const axe: ItemDefinition = {
  id: "bronze-axe",
  name: "Bronze axe",
  stackable: false,
};

describe("Inventory", () => {
  it("uses one slot for a stack of resources", () => {
    const original = createInventory(2);
    const first = addInventoryItem(original, ore, 5);
    const second = addInventoryItem(first, ore, 3);
    expect(original.slots).toEqual([]);
    expect(second.slots).toEqual([{ itemId: "copper-ore", quantity: 8 }]);
    expect(usedInventorySlots(second)).toBe(1);
    expect(availableInventorySlots(second)).toBe(1);
  });

  it("uses a separate slot for every non-stackable item", () => {
    const inventory = addInventoryItem(createInventory(3), axe, 2);
    expect(inventory.slots).toEqual([
      { itemId: "bronze-axe", quantity: 1 },
      { itemId: "bronze-axe", quantity: 1 },
    ]);
    expect(countInventoryItem(inventory, axe.id)).toBe(2);
    expect(usedInventorySlots(inventory)).toBe(2);
  });

  it("rejects over-capacity additions without modifying the original inventory", () => {
    const inventory = addInventoryItem(createInventory(2), axe, 1);
    expect(() => addInventoryItem(inventory, axe, 2)).toThrow(
      InventoryCapacityError,
    );
    expect(inventory.slots).toEqual([{ itemId: "bronze-axe", quantity: 1 }]);
    expect(() => addInventoryItem(inventory, ore, 0)).toThrow(RangeError);
  });

  it("removes both partial stacks and individual items immutably", () => {
    const mixed = addInventoryItem(
      addInventoryItem(createInventory(4), ore, 9),
      axe,
      2,
    );
    const withoutOre = removeInventoryItem(mixed, ore.id, 4);
    const withoutAxe = removeInventoryItem(withoutOre, axe.id, 1);
    expect(countInventoryItem(withoutAxe, ore.id)).toBe(5);
    expect(countInventoryItem(withoutAxe, axe.id)).toBe(1);
    expect(usedInventorySlots(withoutAxe)).toBe(2);
    expect(countInventoryItem(mixed, ore.id)).toBe(9);
  });

  it("rejects removal beyond available quantities", () => {
    const inventory = addInventoryItem(createInventory(2), ore, 5);
    expect(() => removeInventoryItem(inventory, ore.id, 6)).toThrow(
      InsufficientItemsError,
    );
    expect(countInventoryItem(inventory, ore.id)).toBe(5);
  });

  it("validates inventory capacity", () => {
    expect(() => createInventory(-1)).toThrow(RangeError);
    expect(() => createInventory(1.5)).toThrow(RangeError);
    expect(createInventory(0)).toEqual({ capacity: 0, slots: [] });
  });
});
