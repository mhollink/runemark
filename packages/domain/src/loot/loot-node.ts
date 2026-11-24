import type { ItemQuantity } from "../items/item-quantity";

export type LootNode =
  | { readonly kind: "nothing" }
  | {
      readonly kind: "fixed";
      readonly drops: readonly ItemQuantity[];
    }
  | {
      readonly kind: "table";
      readonly tableId: string;
    }
  | {
      readonly kind: "conditional";
      readonly oneIn: number;
      readonly success: LootNode;
      readonly failure: LootNode;
    }
  | {
      readonly kind: "weighted";
      readonly entries: readonly {
        readonly weight: number;
        readonly reward: LootNode;
      }[];
    }
  | {
      readonly kind: "all";
      readonly rewards: readonly LootNode[];
    };
