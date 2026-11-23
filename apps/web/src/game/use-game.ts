import { gameContent } from "@runemark/content";
import {
  createCharacter,
  createGameSave,
  type GameSave,
} from "@runemark/domain";
import { advanceGame, executeCommand } from "@runemark/engine";
import { useCallback, useEffect, useState } from "react";

function createInitialGame(): GameSave {
  return createGameSave({
    id: crypto.randomUUID(),
    contentVersion: gameContent.version,
    lastSimulatedAt: Date.now(),
    randomState: crypto.getRandomValues(new Uint32Array(1))[0] ?? 1,
    character: createCharacter({
      id: crypto.randomUUID(),
      name: "Adventurer",
      locationId: "eldvik",
      startingHitpoints: 10,
    }),
  });
}

export function useGame() {
  const [game, setGame] = useState<GameSave>(createInitialGame);

  // Simulation is based on absolute time, not interval duration.
  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = Date.now();

      setGame(
        (current) =>
          advanceGame(current, Math.max(now, current.lastSimulatedAt)).state,
      );
    }, 250);

    return () => window.clearInterval(interval);
  }, []);

  const startActivity = useCallback((siteId: string) => {
    const now = Date.now();

    setGame(
      (current) =>
        executeCommand(
          current,
          { type: "START_ACTIVITY", siteId },
          Math.max(now, current.lastSimulatedAt),
        ).state,
    );
  }, []);

  const stopActivity = useCallback(() => {
    const now = Date.now();

    setGame(
      (current) =>
        executeCommand(
          current,
          { type: "STOP_ACTIVITY" },
          Math.max(now, current.lastSimulatedAt),
        ).state,
    );
  }, []);

  return { game, startActivity, stopActivity };
}
