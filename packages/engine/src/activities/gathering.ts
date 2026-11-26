import type { GameContent } from "@runemark/content";
import {
  availableInventorySlots,
  type GameSave,
  type GatheringActivityDefinition,
  type ItemQuantity,
  type WorldNodeDefinition,
} from "@runemark/domain";
import { guaranteedDrops } from "../loot/resolve-loot";
import { tryAddItems } from "../loot/store-loot";
import type { SimulationResult } from "../simulation-types";
import { collectLoot } from "./shared/activity-loot";
import {
  type ActivityRuntime,
  createActivityRuntime,
  createSimulationResult,
} from "./shared/activity-runtime";
import { bankInventoryOrBlock } from "./shared/activity-session";
import { awardExperience } from "./shared/activity-summary";
import { advancePhaseTime } from "./shared/activity-time";
import { simulateActivity } from "./shared/simulate-activity";

type GatheringRuntime = ActivityRuntime<GatheringActivityDefinition>;

export function simulateGathering(
  state: GameSave,
  content: GameContent,
  node: WorldNodeDefinition,
  activity: GatheringActivityDefinition,
  until: number,
): SimulationResult {
  const runtime = createActivityRuntime(state, content, node, activity, until);
  const guaranteed = guaranteedDrops(activity.rewards, content);
  simulateActivity(runtime, {
    advanceWork: (current) => advanceGathering(current, guaranteed),
  });
  return createSimulationResult(state, runtime);
}

function advanceGathering(
  runtime: GatheringRuntime,
  guaranteed: readonly ItemQuantity[],
): void {
  if (!canGather(runtime, guaranteed)) {
    bankInventoryOrBlock(runtime);
    return;
  }
  if (!advancePhaseTime(runtime, runtime.activity.durationMs)) return;
  completeGathering(runtime);
  if (!canGather(runtime, guaranteed)) bankInventoryOrBlock(runtime);
}

function completeGathering(runtime: GatheringRuntime): void {
  collectLoot(runtime, runtime.activity.rewards);
  runtime.summary.completedActions++;
  awardExperience(
    runtime,
    runtime.activity.skillId,
    runtime.activity.experiencePerAction,
  );
}

function canGather(
  runtime: GatheringRuntime,
  guaranteed: readonly ItemQuantity[],
): boolean {
  const { backpack } = runtime.character;
  if (guaranteed.length === 0) return availableInventorySlots(backpack) > 0;
  return guaranteed.some(
    (drop) => tryAddItems(backpack, runtime.content, [drop]) !== null,
  );
}
