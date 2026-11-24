import { gameContent } from "@runemark/content";
import type { GameSave } from "@runemark/domain";
import { tryProduce } from "./activities/production-operations";
import { findNearestBank, findShortestRoute } from "./navigation/find-route";
import { simulateGame } from "./simulation";
import type { GameCommand, SimulationResult } from "./simulation-types";

export { BANKING_DURATION_MS } from "./logistics/config";
export type {
  GameCommand,
  GameEvent,
  SimulationResult,
  SimulationSummary,
} from "./simulation-types";

export function advanceGame(state: GameSave, until: number): SimulationResult {
  return simulateGame(state, gameContent, until);
}

export function executeCommand(
  state: GameSave,
  command: GameCommand,
  at: number,
): SimulationResult {
  const result = advanceGame(state, at);

  if (command.type === "STOP_ACTIVITY") {
    return {
      ...result,
      state: {
        ...result.state,
        activeActivity: null,
      },
    };
  }

  const site = gameContent.sites[command.siteId];
  const activity = gameContent.activities[command.activityId];
  if (!site || !activity) {
    throw new Error(
      `Unknown site or activity: ${command.siteId}/${command.activityId}`,
    );
  }
  if (!site.activityIds.includes(activity.id)) {
    throw new Error(`Activity ${activity.id} is not available at ${site.id}`);
  }

  const character = result.state.character;

  const requiresBank =
    (activity.kind === "production" &&
      tryProduce(character.backpack, activity, gameContent) === null) ||
    (activity.kind === "combat" && character.currentHitpoints === 0);

  const legs = requiresBank
    ? findNearestBank(gameContent, character.nodeId)
    : findShortestRoute(gameContent, character.nodeId, site.id);

  if (legs === null) {
    throw new Error(`No accessible route for ${site.id}`);
  }

  return {
    ...result,
    state: {
      ...result.state,
      activeActivity: {
        siteId: site.id,
        activityId: activity.id,
        status: "running",
        phase: requiresBank
          ? legs.length === 0
            ? "banking"
            : "travel-to-bank"
          : legs.length === 0
            ? "working"
            : "travel-to-site",
        elapsedMs: 0,
        travel: legs.length === 0 ? null : { legs, index: 0 },
      },
    },
  };
}
