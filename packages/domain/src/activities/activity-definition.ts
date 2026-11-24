import type { ItemDrop, LootNode } from "../loot/loot-node";
import type { SkillId } from "../skills/skill-progress";

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
  readonly inputs: readonly ItemDrop[];
  readonly outputs: readonly ItemDrop[];
}

export type ActivityDefinition =
  | GatheringActivityDefinition
  | ProductionActivityDefinition;
