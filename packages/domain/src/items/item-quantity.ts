import type { ItemId } from "./item-definition";

export interface ItemQuantity {
  readonly itemId: ItemId;
  readonly quantity: number;
}
