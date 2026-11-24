import type { GameContent } from "@runemark/content";
import type {
  ActivitySiteDefinition,
  GameSave,
  ProductionActivityDefinition,
} from "@runemark/domain";
import type { SimulationResult } from "../simulation-types";
import {
  hasBankIngredients,
  tryProduce,
  withdrawProductionBatch,
} from "./production-operations";
import {
  type ActivityRuntime,
  createActivityRuntime,
  createSimulationResult,
} from "./shared/activity-runtime";
import { blockActivity, travelToBank } from "./shared/activity-session";
import { awardExperience, recordItems } from "./shared/activity-summary";
import { advancePhaseTime } from "./shared/activity-time";
import { simulateActivity } from "./shared/simulate-activity";

type ProductionRuntime = ActivityRuntime<ProductionActivityDefinition>;

export function simulateProduction(
  state: GameSave,
  content: GameContent,
  site: ActivitySiteDefinition,
  activity: ProductionActivityDefinition,
  until: number,
): SimulationResult {
  const runtime = createActivityRuntime(state, content, site, activity, until);
  simulateActivity(runtime, {
    advanceWork: advanceProduction,
    prepareAfterBanking: restockIngredients,
  });
  return createSimulationResult(state, runtime);
}

function advanceProduction(runtime: ProductionRuntime): void {
  const produced = tryProduce(
    runtime.character.backpack,
    runtime.activity,
    runtime.content,
  );
  if (produced === null) {
    travelToBank(runtime);
    return;
  }
  if (!advancePhaseTime(runtime, runtime.activity.durationMs)) return;
  runtime.character = { ...runtime.character, backpack: produced };
  completeProduction(runtime);
  if (tryProduce(produced, runtime.activity, runtime.content) === null)
    travelToBank(runtime);
}

function completeProduction(runtime: ProductionRuntime): void {
  const { activity, summary } = runtime;
  summary.completedActions++;
  recordItems(summary.itemsConsumed, activity.inputs);
  recordItems(summary.itemsGained, activity.outputs);
  awardExperience(runtime, activity.skillId, activity.experiencePerAction);
}

function restockIngredients(runtime: ProductionRuntime): void {
  const { activity, content, character, bank } = runtime;
  if (!hasBankIngredients(bank, activity)) {
    blockActivity(runtime, "INSUFFICIENT_MATERIALS");
    return;
  }
  const batch = withdrawProductionBatch(
    bank,
    character.backpack.capacity,
    activity,
    content,
  );
  if (batch.actions === 0) {
    blockActivity(runtime, "INVENTORY_FULL");
    return;
  }
  runtime.bank = batch.bank;
  runtime.character = { ...character, backpack: batch.backpack };
}
