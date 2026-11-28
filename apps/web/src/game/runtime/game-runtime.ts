import type { GameSave } from "@runemark/domain";
import type { SaveManager } from "@/game";
import { createGameStore, type GameStoreDependencies } from "@/game";
import {
  type InitializeGameDependencies,
  initializeGame,
} from "./initialize-game";
import { createOfflineReport } from "./offline-report";

export interface GameRuntimeDependencies extends InitializeGameDependencies {
  readonly execute: GameStoreDependencies["execute"];
  readonly saveManager: Pick<SaveManager, "load" | "save">;
}

export function createGameRuntime(dependencies: GameRuntimeDependencies) {
  const { saveManager } = dependencies;

  let initialization: Promise<void> | undefined;

  const store = createGameStore({
    now: dependencies.now,
    execute: dependencies.execute,

    onCommandExecuted: () => {
      void save();
    },
  });

  function initialize(): Promise<void> {
    initialization ??= initializeRuntime();

    return initialization;
  }

  async function initializeRuntime(): Promise<void> {
    try {
      const initialized = await initializeGame(saveManager, dependencies);

      await persistSnapshot(initialized.game);

      store.setState({
        game: initialized.game,
        status: "ready",
        offlineReport: initialized.offlineReport,
        runtimeError: null,
      });
    } catch (error) {
      store.setState({
        status: "error",
        runtimeError: errorMessage(error, "Unable to initialize the game."),
      });
    }
  }

  function tick(): void {
    advance(false);
  }

  function resume(): void {
    advance(true);
    void save();
  }

  function suspend(): void {
    tick();
    void save();
  }

  function advance(reportOfflineProgress: boolean): void {
    const { game, status } = store.getState();

    if (!game || status !== "ready") return;

    try {
      const until = Math.max(dependencies.now(), game.lastSimulatedAt);

      if (until === game.lastSimulatedAt) return;

      const elapsedMs = until - game.lastSimulatedAt;

      const result = dependencies.advance(game, until);

      const offlineReport = reportOfflineProgress
        ? createOfflineReport(result, elapsedMs)
        : null;

      store.setState({
        game: result.state,

        ...(offlineReport ? { offlineReport } : {}),
      });
    } catch (error) {
      store.setState({
        status: "error",
        runtimeError: errorMessage(error, "Unable to advance the game."),
      });
    }
  }

  async function save(): Promise<void> {
    const { game, status } = store.getState();

    if (!game || status !== "ready") return;

    await persistSnapshot(game);
  }

  async function persistSnapshot(game: GameSave): Promise<void> {
    try {
      await saveManager.save(game);

      store.setState({
        storageError: null,
      });
    } catch (error) {
      store.setState({
        storageError: errorMessage(error, "Unable to save the game."),
      });
    }
  }

  async function reset(): Promise<void> {
    if (store.getState().status === "loading") {
      return;
    }

    store.setState({
      status: "loading",
      runtimeError: null,
    });

    try {
      const game = dependencies.createInitialGame();

      await saveManager.save(game);

      store.setState({
        game,
        status: "ready",
        offlineReport: null,
        runtimeError: null,
        storageError: null,
        commandError: null,
      });
    } catch (error) {
      store.setState({
        status: "error",
        runtimeError: errorMessage(error, "Unable to reset the game."),
      });
    }
  }

  return {
    store,
    initialize,
    tick,
    resume,
    suspend,
    save,
    reset,
  };
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export type GameRuntime = ReturnType<typeof createGameRuntime>;
