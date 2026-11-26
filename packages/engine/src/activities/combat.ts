import type { GameContent } from "@runemark/content";
import {
  availableInventorySlots,
  type CombatActivityDefinition,
  type GameSave,
  type ItemQuantity,
  type MonsterDefinition,
  type WorldNodeDefinition,
} from "@runemark/domain";
import { advanceEncounter, createEncounter } from "../combat/encounter";
import { getPlayerCombatStats } from "../combat/player-stats";
import { guaranteedDrops } from "../loot/resolve-loot";
import { tryAddItems } from "../loot/store-loot";
import type { SimulationResult } from "../simulation-types";
import { collectLoot } from "./shared/activity-loot";
import {
  type ActivityRuntime,
  createActivityRuntime,
  createSimulationResult,
} from "./shared/activity-runtime";
import {
  bankInventoryOrBlock,
  blockActivity,
  clearCombatProgress,
} from "./shared/activity-session";
import { awardExperience } from "./shared/activity-summary";
import { remainingSimulationTime } from "./shared/activity-time";
import { simulateActivity } from "./shared/simulate-activity";

type CombatRuntime = ActivityRuntime<CombatActivityDefinition>;

export function simulateCombat(
  state: GameSave,
  content: GameContent,
  node: WorldNodeDefinition,
  activity: CombatActivityDefinition,
  until: number,
): SimulationResult {
  const runtime = createActivityRuntime(state, content, node, activity, until);
  const monster = content.monsters[activity.monsterId];
  if (!monster) throw new Error(`Unknown monster: ${activity.monsterId}`);
  const guaranteed = guaranteedDrops(monster.loot, content);
  simulateActivity(runtime, {
    advanceWork: (current) => advanceCombat(current, monster, guaranteed),
  });
  return createSimulationResult(state, runtime);
}

function advanceCombat(
  runtime: CombatRuntime,
  monster: MonsterDefinition,
  guaranteed: readonly ItemQuantity[],
): void {
  if (runtime.character.currentHitpoints <= 0) {
    blockActivity(runtime, "PLAYER_DEFEATED");
    return;
  }
  if (!canStoreCombatLoot(runtime, guaranteed)) {
    bankInventoryOrBlock(runtime);
    return;
  }
  const encounter = advanceEncounter(
    {
      progress: runtime.session.combat ?? createEncounter(monster.combat),
      playerHitpoints: runtime.character.currentHitpoints,
      randomState: runtime.randomState,
    },
    getPlayerCombatStats(runtime.character),
    monster.combat,
    remainingSimulationTime(runtime),
  );
  runtime.cursor += encounter.consumedMs;
  runtime.randomState = encounter.randomState;
  runtime.character = {
    ...runtime.character,
    currentHitpoints: encounter.playerHitpoints,
  };
  runtime.session = { ...runtime.session, combat: encounter.progress };
  switch (encounter.outcome) {
    case "ongoing":
      return;
    case "player-killed":
      blockActivity(runtime, "PLAYER_DEFEATED");
      return;
    case "monster-killed":
      completeEncounter(runtime, monster);
      break;
  }
  if (!canStoreCombatLoot(runtime, guaranteed)) bankInventoryOrBlock(runtime);
}

function completeEncounter(
  runtime: CombatRuntime,
  monster: MonsterDefinition,
): void {
  runtime.summary.completedActions++;
  collectLoot(runtime, monster.loot);
  awardCombatExperience(runtime, monster);
  runtime.session = clearCombatProgress(runtime.session);
}

function awardCombatExperience(
  runtime: CombatRuntime,
  monster: MonsterDefinition,
): void {
  const { maxHitpoints } = monster.combat;
  awardExperience(runtime, "attack", maxHitpoints * 2);
  awardExperience(runtime, "constitution", maxHitpoints);
}

function canStoreCombatLoot(
  runtime: CombatRuntime,
  guaranteed: readonly ItemQuantity[],
): boolean {
  const { backpack } = runtime.character;
  if (guaranteed.length === 0) return availableInventorySlots(backpack) > 0;
  return tryAddItems(backpack, runtime.content, guaranteed) !== null;
}
