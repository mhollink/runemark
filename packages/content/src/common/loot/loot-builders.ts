import type { ItemId, LootNode } from "@runemark/domain";

export function fixedDrop(itemId: ItemId, quantity = 1): LootNode {
  return { kind: "fixed", drops: [{ itemId, quantity }] };
}

export function currencyDrop(amount: number): LootNode {
  return { kind: "currency", amount };
}

export function quantityRange(
  itemId: ItemId,
  min: number,
  max: number,
): LootNode {
  return rewardRange(min, max, (quantity) => fixedDrop(itemId, quantity));
}

export function currencyRange(min: number, max: number): LootNode {
  return rewardRange(min, max, currencyDrop);
}

function rewardRange(
  min: number,
  max: number,
  reward: (amount: number) => LootNode,
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
      reward: reward(min + index),
    })),
  };
}
