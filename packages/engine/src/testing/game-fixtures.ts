import { gameContent } from "@runemark/content";
import {
  createCharacter,
  createGameSave,
  type GameSave,
} from "@runemark/domain";

export const START = 1_790_000_000_000;

export function createTestGame(): GameSave {
  return createGameSave({
    id: "test-save",
    contentVersion: gameContent.version,
    lastSimulatedAt: START,
    randomState: 42,
    character: createCharacter({
      id: "test-character",
      name: "Eira",
      locationId: "eldvik",
      skills: Object.values(gameContent.skills),
    }),
  });
}
