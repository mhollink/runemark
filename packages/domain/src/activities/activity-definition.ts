import type { ItemQuantity } from "../items/item-quantity";
import type { LootNode } from "../loot/loot-node";
import type { SkillId } from "../skills/skill";
import type { SkillRequirement } from "../skills/skill-requirement";
import type { LocationFacility } from "../world/location";

interface BaseActivityDefinition {
  readonly id: string;
  readonly name: string;
  readonly requirements?: readonly SkillRequirement[];
}

interface SkillingActivityDefinition extends BaseActivityDefinition {
  readonly skillId: SkillId;
  readonly durationMs: number;
  readonly experiencePerAction: number;
}

export interface GatheringActivityDefinition
  extends SkillingActivityDefinition {
  readonly kind: "gathering";
  readonly rewards: LootNode;
}

type ProductionFacility = Exclude<LocationFacility, "bank">;
export interface ProductionActivityDefinition
  extends SkillingActivityDefinition {
  readonly kind: "production";
  readonly inputs: readonly ItemQuantity[];
  readonly outputs: readonly ItemQuantity[];
  readonly requiredFacility: readonly ProductionFacility[];
}

export interface CombatActivityDefinition extends BaseActivityDefinition {
  readonly kind: "combat";
  readonly monsterId: string;
}

export type ActivityDefinition =
  | GatheringActivityDefinition
  | ProductionActivityDefinition
  | CombatActivityDefinition;
