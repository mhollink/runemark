import type { ItemQuantity } from "../items/item-quantity";

export type LootNode =
  | { kind: "nothing" }
  | { kind: "fixed"; drops: readonly ItemQuantity[] }
  | { kind: "table"; readonly tableId: string }
  | {
      kind: "conditional";
      readonly oneIn: number;
      readonly success: LootNode;
      readonly failure: LootNode;
    }
  | {
      kind: "weighted";
      entries: readonly {
        readonly weight: number;
        readonly reward: LootNode;
      }[];
    }
  | {
      kind: "all";
      rewards: readonly LootNode[];
    };
