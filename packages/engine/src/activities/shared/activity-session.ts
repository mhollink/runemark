import type {
  ActivityPhase,
  ActivitySession,
  TravelLeg,
} from "@runemark/domain";
import {
  findNearestBank,
  findShortestRoute,
} from "../../navigation/find-route";
import type { GameEvent } from "../../simulation-types";
import type { ActivityRuntime } from "./activity-runtime";

export type TravelPhase = "travel-to-bank" | "travel-to-site";

export function phaseAfterTravel(phase: TravelPhase): ActivityPhase {
  return phase === "travel-to-bank" ? "banking" : "working";
}

export function clearCombatProgress(session: ActivitySession): ActivitySession {
  const { combat: _combat, ...remaining } = session;
  return remaining;
}

export function transitionToTravel(
  session: ActivitySession,
  destination: TravelPhase,
  legs: readonly TravelLeg[],
): ActivitySession {
  return {
    ...clearCombatProgress(session),
    phase: legs.length > 0 ? destination : phaseAfterTravel(destination),
    elapsedMs: 0,
    travel: legs.length > 0 ? { legs, index: 0 } : null,
  };
}

export function blockActivity(
  runtime: ActivityRuntime,
  reason: GameEvent["reason"],
): void {
  runtime.session = {
    ...clearCombatProgress(runtime.session),
    status: "blocked",
    phase: "working",
    elapsedMs: 0,
    travel: null,
  };
  runtime.events.push({
    type: "ACTIVITY_BLOCKED",
    siteId: runtime.site.id,
    activityId: runtime.activity.id,
    timestamp: runtime.cursor,
    reason,
  });
}

export function travelToBank(
  runtime: ActivityRuntime,
  requiresDeposit = false,
): void {
  const route = findNearestBank(runtime.content, runtime.character.nodeId);
  if (route === null) {
    blockActivity(runtime, "BANK_UNAVAILABLE");
    return;
  }
  if (requiresDeposit && runtime.character.backpack.slots.length === 0) {
    blockActivity(runtime, "INVENTORY_FULL");
    return;
  }
  runtime.session = transitionToTravel(
    runtime.session,
    "travel-to-bank",
    route,
  );
}

export function travelToActivitySite(runtime: ActivityRuntime): void {
  const route = findShortestRoute(
    runtime.content,
    runtime.character.nodeId,
    runtime.site.id,
  );
  if (route === null) {
    blockActivity(runtime, "BANK_UNAVAILABLE");
    return;
  }
  runtime.session = transitionToTravel(
    runtime.session,
    "travel-to-site",
    route,
  );
}

export function bankInventoryOrBlock(runtime: ActivityRuntime): void {
  travelToBank(runtime, true);
}
