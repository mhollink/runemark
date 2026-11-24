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
  if (!site) {
    throw new Error(`Unknown activity site: ${command.siteId}`);
  }

  const activity = gameContent.activities[site.activityId];
  if (!activity) {
    throw new Error(`Unknown activity: ${site.activityId}`);
  }

  const character = result.state.character;

  const requiresBank =
    activity.kind === "production" &&
    tryProduce(character.backpack, activity, gameContent) === null;

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
