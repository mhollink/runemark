import type { GameSave } from "@runemark/domain";
import type { GameCommand, SimulationResult } from "@runemark/engine";
import { createStore } from "zustand/vanilla";
import type { OfflineReport } from "../runtime/offline-report";

export type GameStatus = "loading" | "ready" | "error";

export interface GameState {
  readonly game: GameSave | null;
  readonly status: GameStatus;
  readonly runtimeError: string | null;
  readonly storageError: string | null;
  readonly commandError: string | null;
  readonly offlineReport: OfflineReport | null;
}

export interface GameActions {
  dispatch(command: GameCommand): void;

  startActivity(nodeId: string, activityId: string): void;
  stopActivity(): void;

  dismissCommandError(): void;
  dismissOfflineReport(): void;
}

export type GameStore = GameState & GameActions;

export interface GameStoreDependencies {
  readonly now: () => number;

  readonly execute: (
    game: GameSave,
    command: GameCommand,
    at: number,
  ) => SimulationResult;

  readonly onCommandExecuted?: () => void;
}

export function createGameStore(
  dependencies: GameStoreDependencies,
  initialGame: GameSave | null = null,
) {
  return createStore<GameStore>()((set, get) => ({
    game: initialGame,
    status: initialGame ? "ready" : "loading",
    runtimeError: null,
    storageError: null,
    commandError: null,
    offlineReport: null,

    dispatch: (command) => {
      const { game, status } = get();

      if (!game || status !== "ready") return;

      try {
        const at = Math.max(dependencies.now(), game.lastSimulatedAt);
        const result = dependencies.execute(game, command, at);

        set({
          game: result.state,
          commandError: null,
        });
      } catch (error) {
        set({
          commandError:
            error instanceof Error
              ? error.message
              : "Unable to execute game command.",
        });

        return;
      }

      dependencies.onCommandExecuted?.();
    },

    startActivity: (nodeId, activityId) => {
      get().dispatch({
        type: "START_ACTIVITY",
        nodeId,
        activityId,
      });
    },
    stopActivity: () => get().dispatch({ type: "STOP_ACTIVITY" }),

    dismissCommandError: () => set({ commandError: null }),
    dismissOfflineReport: () => set({ offlineReport: null }),
  }));
}

export type GameStoreApi = ReturnType<typeof createGameStore>;
