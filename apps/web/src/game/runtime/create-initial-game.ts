import { gameContent } from "@runemark/content";
import {
  createCharacter,
  createGameSave,
  type GameSave,
} from "@runemark/domain";

export function createInitialGame(): GameSave {
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
