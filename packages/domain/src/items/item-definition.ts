/** Static game content, referenced by inventory entries using the item's ID. */
export interface ItemDefinition {
  readonly id: string;
  readonly name: string;
  readonly stackable: boolean;
}

export type ItemId = ItemDefinition["id"];
