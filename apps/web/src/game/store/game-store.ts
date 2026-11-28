import type { GameSave } from "@runemark/domain";
import type { GameCommand, SimulationResult } from "@runemark/engine";
import { createStore } from "zustand/vanilla";

export interface GameState {
  readonly game: GameSave | null;
  readonly commandError: string | null;
}

export interface GameActions {
  dispatch(command: GameCommand): void;

  startActivity(nodeId: string, activityId: string): void;
  stopActivity(): void;

  dismissCommandError(): void;
}

export type GameStore = GameState & GameActions;

export interface GameStoreDependencies {
  readonly now: () => number;

  readonly execute: (
    game: GameSave,
    command: GameCommand,
    at: number,
  ) => SimulationResult;
}

export function createGameStore(
  dependencies: GameStoreDependencies,
  initialGame: GameSave | null = null,
) {
  return createStore<GameStore>()((set, get) => ({
    game: initialGame,
    commandError: null,

    dispatch: (command) => {
      const { game } = get();
      if (!game) return;

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
      }
    },

    startActivity: (nodeId, activityId) => {
      get().dispatch({
        type: "START_ACTIVITY",
        nodeId,
        activityId,
      });
    },

    stopActivity: () => {
      get().dispatch({ type: "STOP_ACTIVITY" });
    },

    dismissCommandError: () => {
      set({ commandError: null });
    },
  }));
}

export type GameStoreApi = ReturnType<typeof createGameStore>;
