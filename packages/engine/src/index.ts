import { gameContent } from "@runemark/content";
import type { GameSave } from "@runemark/domain";
import { executeGameCommand } from "./commands/execute-command";
import { simulateGame } from "./simulation";
import type { GameCommand, SimulationResult } from "./simulation-types";

export { getPlayerCombatStats } from "./combat/player-stats";
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
  return executeGameCommand(state, gameContent, command, at);
}
