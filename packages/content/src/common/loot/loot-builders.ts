import type { ItemId, LootNode } from "@runemark/domain";

export function fixedDrop(itemId: ItemId, quantity = 1): LootNode {
  return { kind: "fixed", drops: [{ itemId, quantity }] };
}

/** Every integer quantity in the inclusive range has an equal probability. */
export function quantityRange(
  itemId: ItemId,
  min: number,
  max: number,
): LootNode {
  if (
    !Number.isSafeInteger(min) ||
    !Number.isSafeInteger(max) ||
    min < 1 ||
    max < min
  ) {
    throw new RangeError("Invalid loot quantity range");
  }

  return {
    kind: "weighted",
    entries: Array.from({ length: max - min + 1 }, (_, index) => ({
      weight: 1,
      reward: fixedDrop(itemId, min + index),
    })),
  };
}
