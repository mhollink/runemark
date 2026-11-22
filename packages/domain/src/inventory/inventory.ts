import type { ItemDefinition, ItemId } from "../items/item-definition";
import {
  assertNonEmptyString,
  assertNonNegativeSafeInteger,
  assertPositiveSafeInteger,
} from "../shared/validation";

/** Each entry occupies one slot. Non-stackable items always use quantity 1 per entry. */
export interface InventorySlot {
  readonly itemId: ItemId;
  readonly quantity: number;
}

/** A null capacity represents an unbounded inventory, such as the bank. */
export interface Inventory {
  readonly capacity: number | null;
  readonly slots: readonly InventorySlot[];
}

export class InventoryCapacityError extends Error {
  override name = "InventoryCapacityError";
}

export class InsufficientItemsError extends Error {
  override name = "InsufficientItemsError";
}

export function createInventory(capacity: number | null): Inventory {
  if (capacity !== null) {
    assertNonNegativeSafeInteger(capacity, "Inventory capacity");
  }
  return { capacity, slots: [] };
}

export function usedInventorySlots(inventory: Inventory): number {
  return inventory.slots.length;
}

export function availableInventorySlots(inventory: Inventory): number | null {
  return inventory.capacity === null
    ? null
    : inventory.capacity - inventory.slots.length;
}

export function countInventoryItem(
  inventory: Inventory,
  itemId: ItemId,
): number {
  assertNonEmptyString(itemId, "Item ID");
  return inventory.slots.reduce(
    (total, slot) => total + (slot.itemId === itemId ? slot.quantity : 0),
    0,
  );
}

/** All-or-nothing addition: an insufficient backpack never receives partial loot. */
export function addInventoryItem(
  inventory: Inventory,
  item: ItemDefinition,
  quantity: number,
): Inventory {
  assertNonEmptyString(item.id, "Item ID");
  assertPositiveSafeInteger(quantity, "Quantity");

  const stackIndex = item.stackable
    ? inventory.slots.findIndex((slot) => slot.itemId === item.id)
    : -1;
  const requiredSlots = stackIndex >= 0 ? 0 : item.stackable ? 1 : quantity;
  if (
    inventory.capacity !== null &&
    inventory.slots.length + requiredSlots > inventory.capacity
  ) {
    throw new InventoryCapacityError("Not enough inventory slots");
  }

  if (stackIndex >= 0) {
    const existing = inventory.slots[stackIndex];
    if (existing === undefined) {
      throw new Error(`Inventory stack not found at index ${stackIndex}`);
    }
    const total = existing.quantity + quantity;
    if (!Number.isSafeInteger(total)) {
      throw new RangeError("Item stack exceeds the safe integer limit");
    }
    return {
      ...inventory,
      slots: inventory.slots.map((slot, index) =>
        index === stackIndex ? { ...slot, quantity: total } : slot,
      ),
    };
  }

  const added: InventorySlot[] = item.stackable
    ? [{ itemId: item.id, quantity }]
    : Array.from({ length: quantity }, () => ({
        itemId: item.id,
        quantity: 1,
      }));
  return { ...inventory, slots: [...inventory.slots, ...added] };
}

/** Removes items without changing the original inventory if the operation fails. */
export function removeInventoryItem(
  inventory: Inventory,
  itemId: ItemId,
  quantity: number,
): Inventory {
  assertNonEmptyString(itemId, "Item ID");
  assertPositiveSafeInteger(quantity, "Quantity");
  if (countInventoryItem(inventory, itemId) < quantity) {
    throw new InsufficientItemsError("Not enough items in inventory");
  }

  let remaining = quantity;
  const slots: InventorySlot[] = [];
  for (const slot of inventory.slots) {
    if (slot.itemId !== itemId || remaining === 0) {
      slots.push(slot);
      continue;
    }
    const consumed = Math.min(slot.quantity, remaining);
    remaining -= consumed;
    if (consumed < slot.quantity) {
      slots.push({ ...slot, quantity: slot.quantity - consumed });
    }
  }
  return { ...inventory, slots };
}
