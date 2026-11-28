import { gameContent } from "@runemark/content";
import { advanceGame, executeCommand } from "@runemark/engine";
import { createIndexedDbSaveRepository } from "./persistence/indexed-db-save-repository";
import { createSaveManager } from "./persistence/save-manager";
import { createInitialGame } from "./runtime/create-initial-game";
import { createGameRuntime } from "./runtime/game-runtime";

export function createGameApplication() {
  const repository = createIndexedDbSaveRepository();

  const saveManager = createSaveManager(repository, gameContent);

  return createGameRuntime({
    now: Date.now,
    advance: advanceGame,
    execute: executeCommand,
    createInitialGame,
    saveManager,
  });
}
