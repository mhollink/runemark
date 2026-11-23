import type { ItemId } from "../items/item-definition";

export interface ItemDrop {
  readonly itemId: ItemId;
  readonly quantity: number;
}

export type LootNode =
  | { kind: "nothing" }
  | { kind: "fixed"; drops: readonly ItemDrop[] }
  | { kind: "table"; tableId: string }
  | {
      kind: "conditional";
      oneIn: number;
      success: LootNode;
      failure: LootNode;
    }
  | {
      kind: "weighted";
      entries: readonly {
        weight: number;
        reward: LootNode;
      }[];
    }
  | {
      kind: "all";
      rewards: readonly LootNode[];
    };
