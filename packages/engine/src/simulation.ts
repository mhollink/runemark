import type { GameContent } from "@runemark/content";
import type { GameSave } from "@runemark/domain";
import { simulateCombat } from "./activities/combat";
import { simulateGathering } from "./activities/gathering";
import { simulateProduction } from "./activities/production";
import type { SimulationResult, SimulationSummary } from "./simulation-types";

const EMPTY_SUMMARY: SimulationSummary = {
  completedActions: 0,
  itemsGained: {},
  itemsConsumed: {},
  experienceGained: {},
  bankTrips: 0,
  itemsBanked: {},
};

export function simulateGame(
  state: GameSave,
  content: GameContent,
  until: number,
): SimulationResult {
  if (!Number.isSafeInteger(until) || until < state.lastSimulatedAt) {
    throw new RangeError("Invalid simulation timestamp");
  }

  if (state.contentVersion !== content.version) {
    throw new Error("Content version mismatch");
  }

  if (until === state.lastSimulatedAt) {
    return { state, events: [], summary: EMPTY_SUMMARY };
  }

  const session = state.activeActivity;

  if (!session || session.status === "blocked") {
    return {
      state: { ...state, lastSimulatedAt: until },
      events: [],
      summary: EMPTY_SUMMARY,
    };
  }

  const site = content.sites[session.siteId];
  const activity = content.activities[session.activityId];

  if (!site || !activity) {
    throw new Error(
      `Unknown site or activity: ${session.siteId}/${session.activityId}`,
    );
  }

  switch (activity.kind) {
    case "gathering":
      return simulateGathering(state, content, site, activity, until);
    case "production":
      return simulateProduction(state, content, site, activity, until);
    case "combat":
      return simulateCombat(state, content, site, activity, until);
  }
}
