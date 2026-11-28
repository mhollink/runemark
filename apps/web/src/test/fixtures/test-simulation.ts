import type { GameSave } from "@runemark/domain";
import type { SimulationResult, SimulationSummary } from "@runemark/engine";

export function createSimulationResult(
  state: GameSave,
  summary: Partial<SimulationSummary> = {},
): SimulationResult {
  return {
    state,
    events: [],
    summary: {
      completedActions: 0,
      coinsGained: 0,
      itemsGained: {},
      itemsConsumed: {},
      experienceGained: {},
      bankTrips: 0,
      itemsBanked: {},
      ...summary,
    },
  };
}
