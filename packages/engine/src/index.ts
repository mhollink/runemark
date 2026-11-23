import { gameContent } from "@runemark/content";
import type { GameSave } from "@runemark/domain";
import { findShortestRoute } from "./navigation/find-route";
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

  if (!gameContent.activities[site.activityId]) {
    throw new Error(`Unknown activity: ${site.activityId}`);
  }

  if (site.locationId !== result.state.character.locationId) {
    throw new Error(
      `Activity site ${site.id} is not available at this location`,
    );
  }

  const legs = findShortestRoute(
    gameContent,
    result.state.character.nodeId,
    site.id,
  );

  if (legs === null) {
    throw new Error(`No accessible route to ${site.id}`);
  }

  return {
    ...result,
    state: {
      ...result.state,
      activeActivity: {
        siteId: site.id,
        status: "running",
        phase: legs.length === 0 ? "working" : "travel-to-site",
        elapsedMs: 0,
        travel: legs.length === 0 ? null : { legs, index: 0 },
      },
    },
  };
}
