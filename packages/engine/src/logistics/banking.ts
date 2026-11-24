import {
  createInventory,
  depositInventory,
  maxHitpointsForCharacter,
} from "@runemark/domain";
import type { ActivityRuntime } from "../activities/shared/activity-runtime";
import { recordItems } from "../activities/shared/activity-summary";
import { advancePhaseTime } from "../activities/shared/activity-time";
import { BANKING_DURATION_MS } from "./config";

export function advanceBanking(runtime: ActivityRuntime): boolean {
  assertBankLocation(runtime);
  if (!advancePhaseTime(runtime, BANKING_DURATION_MS)) return false;
  depositBackpack(runtime);
  restoreHitpoints(runtime);
  runtime.summary.bankTrips++;
  return true;
}

function assertBankLocation(runtime: ActivityRuntime): void {
  const location = runtime.content.locations[runtime.character.nodeId];
  if (!location?.facilities?.includes("bank")) {
    throw new Error(`No bank at ${runtime.character.nodeId}`);
  }
}

function depositBackpack(runtime: ActivityRuntime): void {
  const { backpack } = runtime.character;
  runtime.bank = depositInventory(runtime.bank, backpack);
  recordItems(runtime.summary.itemsBanked, backpack.slots);
  runtime.character = {
    ...runtime.character,
    backpack: createInventory(backpack.capacity),
  };
}

function restoreHitpoints(runtime: ActivityRuntime): void {
  runtime.character = {
    ...runtime.character,
    currentHitpoints: maxHitpointsForCharacter(runtime.character),
  };
}
