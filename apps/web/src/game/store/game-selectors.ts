import {
  experienceForSkill,
  levelForSkill,
  maxHitpointsForCharacter,
  type SkillId,
  usedInventorySlots,
} from "@runemark/domain";
import type { GameStore } from "./game-store";

// Game

export const selectGame = (state: GameStore) => state.game;

// Character

export const selectCharacter = (state: GameStore) => state.game?.character;

export const selectNodeId = (state: GameStore) => state.game?.character.nodeId;

export const selectLocationId = (state: GameStore) =>
  state.game?.character.locationId;

// Hitpoints

export const selectHitpoints = (state: GameStore) =>
  state.game?.character.currentHitpoints;

export const selectMaxHitpoints = (state: GameStore) => {
  const character = state.game?.character;

  return character ? maxHitpointsForCharacter(character) : undefined;
};

// Currency

export const selectCoins = (state: GameStore) => state.game?.character.coins;

// Inventory

export const selectBackpack = (state: GameStore) =>
  state.game?.character.backpack;

export const selectBackpackCapacity = (state: GameStore) =>
  state.game?.character.backpack.capacity;

export const selectUsedBackpackSlots = (state: GameStore) => {
  const backpack = state.game?.character.backpack;

  return backpack ? usedInventorySlots(backpack) : undefined;
};

// Bank

export const selectBank = (state: GameStore) => state.game?.bank;

// Skills

export const selectSkills = (state: GameStore) => state.game?.character.skills;

export const selectSkillExperience =
  (skillId: SkillId) => (state: GameStore) => {
    const skills = state.game?.character.skills;

    return skills ? experienceForSkill(skills, skillId) : undefined;
  };

export const selectSkillLevel = (skillId: SkillId) => (state: GameStore) => {
  const skills = state.game?.character.skills;

  return skills ? levelForSkill(skills, skillId) : undefined;
};

// Activity

export const selectActiveActivity = (state: GameStore) =>
  state.game?.activeActivity;

// Errors

export const selectCommandError = (state: GameStore) => state.commandError;

// Actions

export const selectDispatch = (state: GameStore) => state.dispatch;

export const selectStartActivity = (state: GameStore) => state.startActivity;

export const selectStopActivity = (state: GameStore) => state.stopActivity;

export const selectDismissCommandError = (state: GameStore) =>
  state.dismissCommandError;
