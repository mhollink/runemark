import { createInventory, type Inventory } from "../inventory/inventory";
import { assertNonEmptyString } from "../shared/validation";
import type { SkillDefinition } from "../skills/skill";
import type { SkillProgress } from "../skills/skill-progress";
import { createSkillProgress, levelForSkill } from "../skills/skill-progress";

export const INITIAL_BACKPACK_CAPACITY = 10;

export interface Character {
  readonly id: string;
  readonly name: string;
  readonly nodeId: string;
  readonly locationId: string;
  readonly currentHitpoints: number;
  readonly skills: SkillProgress;
  readonly backpack: Inventory;
}

export interface NewCharacter {
  readonly id: string;
  readonly name: string;
  readonly locationId: string;
  readonly skills: readonly SkillDefinition[];
}

export function createCharacter(input: NewCharacter): Character {
  assertNonEmptyString(input.id, "Character ID");
  assertNonEmptyString(input.name, "Character name");
  assertNonEmptyString(input.locationId, "Location ID");

  const skills = createSkillProgress(input.skills);
  return {
    id: input.id,
    name: input.name,
    nodeId: input.locationId,
    locationId: input.locationId,
    currentHitpoints: levelForSkill(skills, "constitution"),
    skills: skills,
    backpack: createInventory(INITIAL_BACKPACK_CAPACITY),
  };
}

export function maxHitpointsForCharacter(character: Character): number {
  return levelForSkill(character.skills, "constitution");
}
