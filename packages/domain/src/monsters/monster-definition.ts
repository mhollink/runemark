import type { LootNode } from "../loot/loot-node";

export interface MonsterDefinition {
  readonly id: string;
  readonly name: string;
  readonly loot: LootNode;
}
