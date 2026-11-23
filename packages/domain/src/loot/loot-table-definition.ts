import type { LootNode } from "./loot-node";

export type LootTableDefinition = LootNode & {
  readonly id: string;
};
