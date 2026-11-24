import type { GameContent } from "@runemark/content";
import {
  addInventoryItem,
  type Inventory,
  InventoryCapacityError,
  type ItemId,
  type ItemQuantity,
} from "@runemark/domain";

export interface StoredLoot {
  readonly inventory: Inventory;
  readonly accepted: readonly ItemQuantity[];
}

export function requireItem(content: GameContent, itemId: ItemId) {
  const item = content.items[itemId];
  if (!item) throw new Error(`Unknown item: ${itemId}`);
  return item;
}

export function addItemQuantity(
  inventory: Inventory,
  content: GameContent,
  item: ItemQuantity,
): Inventory {
  return addInventoryItem(
    inventory,
    requireItem(content, item.itemId),
    item.quantity,
  );
}

/** Atomic addition: return null on capacity failure without mutating inventory. */
export function tryAddItems(
  inventory: Inventory,
  content: GameContent,
  items: readonly ItemQuantity[],
): Inventory | null {
  try {
    return items.reduce(
      (current, item) => addItemQuantity(current, content, item),
      inventory,
    );
  } catch (error) {
    if (error instanceof InventoryCapacityError) return null;
    throw error;
  }
}

/** Store whole drop entries in resolution order, skipping those that do not fit. */
export function storeLoot(
  inventory: Inventory,
  content: GameContent,
  drops: readonly ItemQuantity[],
): StoredLoot {
  let current = inventory;
  const accepted: ItemQuantity[] = [];
  for (const drop of drops) {
    const updated = tryAddItems(current, content, [drop]);
    if (updated !== null) {
      current = updated;
      accepted.push(drop);
    }
  }
  return { inventory: current, accepted };
}
