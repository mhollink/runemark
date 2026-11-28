import type { GameSave } from "@runemark/domain";
import type { SimulationResult } from "@runemark/engine";
import type { SaveManager } from "@/game";
import { createOfflineReport, type OfflineReport } from "./offline-report";

export interface InitializeGameDependencies {
  readonly now: () => number;

  readonly advance: (game: GameSave, until: number) => SimulationResult;

  readonly createInitialGame: () => GameSave;
}

export interface InitializedGame {
  readonly game: GameSave;
  readonly offlineReport: OfflineReport | null;
}

export async function initializeGame(
  saveManager: Pick<SaveManager, "load">,
  dependencies: InitializeGameDependencies,
): Promise<InitializedGame> {
  const saved = await saveManager.load();

  if (!saved) {
    return {
      game: dependencies.createInitialGame(),
      offlineReport: null,
    };
  }

  const until = Math.max(dependencies.now(), saved.lastSimulatedAt);
  const elapsedMs = until - saved.lastSimulatedAt;
  const result = dependencies.advance(saved, until);

  return {
    game: result.state,
    offlineReport: createOfflineReport(result, elapsedMs),
  };
}
