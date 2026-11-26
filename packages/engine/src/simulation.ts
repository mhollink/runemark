import type { GameContent } from "@runemark/content";
import type { GameSave } from "@runemark/domain";
import { simulateCombat } from "./activities/combat";
import { simulateGathering } from "./activities/gathering";
import { simulateProduction } from "./activities/production";
import { createActivitySummary } from "./activities/shared/activity-summary";
import { resolveActivity } from "./activities/shared/resolve-activity";
import type { SimulationResult } from "./simulation-types";

export function simulateGame(
  state: GameSave,
  content: GameContent,
  until: number,
): SimulationResult {
  assertSimulationRequest(state, content, until);
  const session = state.activeActivity;
  if (
    until === state.lastSimulatedAt ||
    !session ||
    session.status === "blocked"
  )
    return createIdleResult(state, until);
  const { node, activity } = resolveActivity(
    content,
    session.nodeId,
    session.activityId,
  );
  switch (activity.kind) {
    case "gathering":
      return simulateGathering(state, content, node, activity, until);
    case "production":
      return simulateProduction(state, content, node, activity, until);
    case "combat":
      return simulateCombat(state, content, node, activity, until);
  }
}

function assertSimulationRequest(
  state: GameSave,
  content: GameContent,
  until: number,
): void {
  if (!Number.isSafeInteger(until) || until < state.lastSimulatedAt)
    throw new RangeError("Invalid simulation timestamp");
  if (state.contentVersion !== content.version)
    throw new Error("Content version mismatch");
}

function createIdleResult(state: GameSave, until: number): SimulationResult {
  return {
    state:
      until === state.lastSimulatedAt
        ? state
        : { ...state, lastSimulatedAt: until },
    events: [],
    summary: createActivitySummary(),
  };
}
