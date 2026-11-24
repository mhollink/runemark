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
    const inventory = addInventoryItem(createInventory(), log, 10);
    const newBank = depositInventory(bank, inventory);

    expect(newBank.items[log.id]).toBe(10);
  });

  it("deposit existing items to the bank", () => {
    const inventory = addInventoryItem(createInventory(), axe, 10);
    const newBank = depositInventory(bank, inventory);

    expect(newBank.items[axe.id]).toBe(15);
  });

  it("withdraw item from bank", () => {
    const newBank = withdrawBankItem(bank, axe.id, 2);

    expect(newBank.items[axe.id]).toBe(3);
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
