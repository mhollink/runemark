import { gameContent } from "@runemark/content";
import {
  createCharacter,
  createGameSave,
  type GameSave,
} from "@runemark/domain";
import { advanceGame, executeCommand } from "@runemark/engine";
import { useCallback, useEffect, useRef, useState } from "react";
import { createOfflineReport, type OfflineReport } from "./offline-report";
import {
  loadGameSave,
  persistGameSave,
  type SaveLoadResult,
} from "./save-storage";

const SAVE_INTERVAL_MS = 5_000;

interface GameRuntime {
  readonly game: GameSave | null;
  readonly offlineReport: OfflineReport | null;
  readonly loadError: string | null;
}

function createInitialGame(): GameSave {
  return createGameSave({
    id: crypto.randomUUID(),
    contentVersion: gameContent.version,
    lastSimulatedAt: Date.now(),
    randomState: crypto.getRandomValues(new Uint32Array(1))[0] ?? 1,
    character: createCharacter({
      id: crypto.randomUUID(),
      name: "Adventurer",
      locationId: "eldenvik",
      skills: Object.values(gameContent.skills),
    }),
  });
}

function initializeGame(): GameRuntime {
  let saved: SaveLoadResult;

  try {
    saved = loadGameSave(window.localStorage);
  } catch {
    // Storage unavailable. The app can still run in memory.
    return {
      game: createInitialGame(),
      offlineReport: null,
      loadError: null,
    };
  }

  if (saved.kind === "invalid") {
    return {
      game: null,
      offlineReport: null,
      loadError: saved.message,
    };
  }

  if (saved.kind === "empty") {
    return {
      game: createInitialGame(),
      offlineReport: null,
      loadError: null,
    };
  }

  const now = Date.now();
  const elapsedMs = Math.max(0, now - saved.save.lastSimulatedAt);

  try {
    const result = advanceGame(
      saved.save,
      Math.max(now, saved.save.lastSimulatedAt),
    );

    return {
      game: result.state,
      offlineReport: createOfflineReport(result, elapsedMs),
      loadError: null,
    };
  } catch {
    return {
      game: null,
      offlineReport: null,
      loadError: "The saved game could not be resumed.",
    };
  }
}

export function useGame() {
  const [runtime, setRuntime] = useState(initializeGame);
  const [storageError, setStorageError] = useState<string | null>(null);

  const latestGame = useRef(runtime.game);
  const lastSavedAt = useRef(0);
  const forceSave = useRef(true);

  useEffect(() => {
    latestGame.current = runtime.game;
  }, [runtime.game]);

  const saveNow = useCallback((game: GameSave) => {
    try {
      persistGameSave(window.localStorage, game);
      lastSavedAt.current = Date.now();
      setStorageError(null);
    } catch {
      setStorageError(
        "Progress could not be saved. Browser storage may be unavailable.",
      );
    }
  }, []);

  // Save periodically, and immediately after player commands.
  useEffect(() => {
    const game = runtime.game;
    if (!game) return;

    if (
      !forceSave.current &&
      Date.now() - lastSavedAt.current < SAVE_INTERVAL_MS
    ) {
      return;
    }

    forceSave.current = false;
    saveNow(game);
  }, [runtime.game, saveNow]);

  // Advance the game while the page is visible.
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;

      const now = Date.now();

      setRuntime((current) => {
        if (!current.game || now <= current.game.lastSimulatedAt) {
          return current;
        }

        return {
          ...current,
          game: advanceGame(current.game, now).state,
        };
      });
    }, 250);

    return () => window.clearInterval(interval);
  }, []);

  // Save when leaving. Catch up and summarize when returning.
  useEffect(() => {
    function saveCurrent() {
      if (latestGame.current) {
        saveNow(latestGame.current);
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === "hidden") {
        saveCurrent();
        return;
      }

      const now = Date.now();
      forceSave.current = true;

      setRuntime((current) => {
        if (!current.game || now <= current.game.lastSimulatedAt) {
          return current;
        }

        const elapsedMs = now - current.game.lastSimulatedAt;
        const result = advanceGame(current.game, now);
        const report = createOfflineReport(result, elapsedMs);

        return {
          ...current,
          game: result.state,
          offlineReport: report ?? current.offlineReport,
        };
      });
    }

    window.addEventListener("pagehide", saveCurrent);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", saveCurrent);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [saveNow]);

  const startActivity = useCallback((nodeId: string, activityId: string) => {
    const now = Date.now();
    forceSave.current = true;

    setRuntime((current) => {
      if (!current.game) return current;

      return {
        ...current,
        game: executeCommand(
          current.game,
          { type: "START_ACTIVITY", nodeId, activityId },
          Math.max(now, current.game.lastSimulatedAt),
        ).state,
      };
    });
  }, []);

  const stopActivity = useCallback(() => {
    const now = Date.now();
    forceSave.current = true;

    setRuntime((current) => {
      if (!current.game) return current;

      return {
        ...current,
        game: executeCommand(
          current.game,
          { type: "STOP_ACTIVITY" },
          Math.max(now, current.game.lastSimulatedAt),
        ).state,
      };
    });
  }, []);

  const dismissOfflineReport = useCallback(() => {
    setRuntime((current) => ({
      ...current,
      offlineReport: null,
    }));
  }, []);

  const resetSave = useCallback(() => {
    const game = createInitialGame();

    // Explicit reset is the only way to overwrite invalid save data.
    try {
      persistGameSave(window.localStorage, game);
      lastSavedAt.current = Date.now();
      latestGame.current = game;
      forceSave.current = false;
      setStorageError(null);

      setRuntime({
        game,
        offlineReport: null,
        loadError: null,
      });
    } catch {
      setStorageError("Could not reset the saved game.");
    }
  }, []);

  return {
    game: runtime.game,
    offlineReport: runtime.offlineReport,
    loadError: runtime.loadError,
    storageError,
    startActivity,
    stopActivity,
    dismissOfflineReport,
    resetSave,
  };
}
