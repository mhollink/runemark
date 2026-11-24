import { describe, expect, it } from "vitest";
import {
  addInventoryItem,
  createInventory,
  InsufficientItemsError,
} from "../inventory/inventory";
import type { ItemDefinition } from "../items/item-definition";
import {
  countBankItem,
  createBankStorage,
  depositInventory,
  withdrawBankItem,
} from "./bank";

const ore: ItemDefinition = {
  id: "copper-ore",
  name: "Copper ore",
  stackable: false,
};
const log: ItemDefinition = {
  id: "birch-log",
  name: "Birch log",
  stackable: true,
};
const axe: ItemDefinition = {
  id: "bronze-axe",
  name: "Bronze axe",
  stackable: false,
};

const bank = {
  items: {
    [ore.id]: 20,
    [axe.id]: 5,
  },
};

describe("Bank", () => {
  it("initializes the starter bank (empty)", () => {
    const newBank = createBankStorage();
    expect(Object.entries(newBank.items).length).toBe(0);
  });

  it("counts the amount of items in the bank", () => {
    expect(countBankItem(bank, "birch-log")).toBe(0);
    expect(countBankItem(bank, ore.id)).toBe(20);
  });

  it("deposit new items to the bank", () => {
    const inventory = addInventoryItem(createInventory(10), log, 10);
    const newBank = depositInventory(bank, inventory);

    expect(newBank.items[log.id]).toBe(10);
  });

  it("deposit existing items to the bank", () => {
    const inventory = addInventoryItem(createInventory(10), axe, 10);
    const newBank = depositInventory(bank, inventory);

    expect(newBank.items[axe.id]).toBe(15);
  });

  it("withdraw item from bank", () => {
    const newBank = withdrawBankItem(bank, axe.id, 2);

    expect(newBank.items[axe.id]).toBe(3);
  });

  it("removes the entry when withdrawing all items", () => {
    const updated = withdrawBankItem(bank, axe.id, 5);

    expect(updated.items[axe.id]).toBeUndefined();
    expect(countBankItem(updated, axe.id)).toBe(0);
  });

  it("does not mutate the original bank", () => {
    const original = {
      items: { [axe.id]: 5 },
    };

    const updated = withdrawBankItem(original, axe.id, 2);

    expect(countBankItem(original, axe.id)).toBe(5);
    expect(countBankItem(updated, axe.id)).toBe(3);
  });

  it("rejects quantity overflow", () => {
    const fullBank = {
      items: { [log.id]: Number.MAX_SAFE_INTEGER },
    };

    const inventory = addInventoryItem(createInventory(1), log, 1);

    expect(() => depositInventory(fullBank, inventory)).toThrow(RangeError);
  });

  it("throws error if withdrawn items are negative", () => {
    expect(() => withdrawBankItem(bank, axe.id, -1)).toThrow(RangeError);
  });

  it("throws error if to much is requested", () => {
    expect(() => withdrawBankItem(bank, axe.id, 6)).toThrow(
      InsufficientItemsError,
    );
  });
});
