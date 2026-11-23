import type { Inventory } from "../inventory/inventory";
import type { ItemId } from "../items/item-definition";

export interface BankStorage {
  readonly items: Readonly<Record<ItemId, number>>;
}

export function createBankStorage(): BankStorage {
  return { items: {} };
}

export function countBankItem(bank: BankStorage, itemId: ItemId): number {
  return Object.hasOwn(bank.items, itemId) ? (bank.items[itemId] ?? 0) : 0;
}

export function depositInventory(
  bank: BankStorage,
  inventory: Inventory,
): BankStorage {
  const items: Record<ItemId, number> = {
    ...bank.items,
  };

  for (const slot of inventory.slots) {
    const total = (items[slot.itemId] ?? 0) + slot.quantity;

    if (!Number.isSafeInteger(total)) {
      throw new RangeError("Bank item quantity overflow");
    }

    items[slot.itemId] = total;
  }

  return { items };
}
