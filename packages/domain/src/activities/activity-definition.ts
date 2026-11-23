import type { LootNode } from "../loot/loot-node";
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

export type ActivityDefinition = GatheringActivityDefinition;
