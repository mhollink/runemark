import { createInventory, type Inventory } from "../inventory/inventory";
import {
  assertNonEmptyString,
  assertPositiveSafeInteger,
} from "../shared/validation";
import type { SkillProgress } from "../skills/skill-progress";

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
  readonly startingHitpoints: number;
}

export function createCharacter(input: NewCharacter): Character {
  assertNonEmptyString(input.id, "Character ID");
  assertNonEmptyString(input.name, "Character name");
  assertNonEmptyString(input.locationId, "Location ID");
  assertPositiveSafeInteger(input.startingHitpoints, "Starting hitpoints");

  return {
    id: input.id,
    name: input.name,
    nodeId: input.locationId,
    locationId: input.locationId,
    currentHitpoints: input.startingHitpoints,
    skills: {},
    backpack: createInventory(INITIAL_BACKPACK_CAPACITY),
  };
}
