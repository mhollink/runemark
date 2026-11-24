import type { Inventory } from "../inventory/inventory";
import { InsufficientItemsError } from "../inventory/inventory";
import type { ItemId } from "../items/item-definition";
import {
  assertNonEmptyString,
  assertPositiveSafeInteger,
} from "../shared/validation";

export interface BankStorage {
  readonly items: Readonly<Record<ItemId, number>>;
}

export function createBankStorage(): BankStorage {
  return { items: {} };
}

export function countBankItem(bank: BankStorage, itemId: ItemId): number {
  assertNonEmptyString(itemId, "Item ID");
  return Object.hasOwn(bank.items, itemId) ? (bank.items[itemId] ?? 0) : 0;
}

export function depositInventory(
  bank: BankStorage,
  inventory: Inventory,
): BankStorage {
  const items: Record<ItemId, number> = { ...bank.items };

  for (const slot of inventory.slots) {
    const total = (items[slot.itemId] ?? 0) + slot.quantity;

    if (!Number.isSafeInteger(total)) {
      throw new RangeError("Bank item quantity overflow");
    }

    items[slot.itemId] = total;
  }

  return { items };
}

export function withdrawBankItem(
  bank: BankStorage,
  itemId: ItemId,
  quantity: number,
): BankStorage {
  assertPositiveSafeInteger(quantity, "Quantity");

  const available = countBankItem(bank, itemId);

  if (available < quantity) {
    throw new InsufficientItemsError("Not enough items in bank");
  }

  const items = { ...bank.items };
  const remaining = available - quantity;

  if (remaining === 0) {
    delete items[itemId];
  } else {
    items[itemId] = remaining;
  }

  return { items };
}
