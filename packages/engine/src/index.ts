import { gameContent } from "@runemark/content";
import type { GameSave } from "@runemark/domain";
import { simulateGame } from "./simulation";
import type { GameCommand, SimulationResult } from "./simulation-types";

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

  return {
    ...result,
    state: {
      ...result.state,
      activeActivity: {
        siteId: site.id,
        elapsedMs: 0,
        status: "running",
        phase: "working",
      },
    },
  };
}
