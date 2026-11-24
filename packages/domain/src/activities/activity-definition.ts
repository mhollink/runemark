import type { ItemQuantity } from "../items/item-quantity";
import type { LootNode } from "../loot/loot-node";
import type { SkillId } from "../skills/skill";

export interface GatheringActivityDefinition {
  readonly id: string;
  readonly kind: "gathering";
  readonly name: string;
  readonly skillId: SkillId;
  readonly durationMs: number;
  readonly experiencePerAction: number;
  readonly rewards: LootNode;
}

export interface ProductionActivityDefinition {
  readonly id: string;
  readonly kind: "production";
  readonly name: string;
  readonly skillId: SkillId;
  readonly durationMs: number;
  readonly experiencePerAction: number;
  readonly inputs: readonly ItemQuantity[];
  readonly outputs: readonly ItemQuantity[];
}

export interface CombatActivityDefinition {
  readonly id: string;
  readonly kind: "combat";
  readonly name: string;
  readonly monsterId: string;
}

export type ActivityDefinition =
  | GatheringActivityDefinition
  | ProductionActivityDefinition
  | CombatActivityDefinition;
