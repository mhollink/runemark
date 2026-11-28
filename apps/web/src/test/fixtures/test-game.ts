import {
  createCharacter,
  createGameSave,
  type GameSave,
} from "@runemark/domain";

export const TEST_TIMESTAMP = 1_790_000_000_000;

export function createTestGame(): GameSave {
  return createGameSave({
    id: "test-save",
    contentVersion: "test-content",
    lastSimulatedAt: TEST_TIMESTAMP,
    randomState: 42,

    character: createCharacter({
      id: "test-character",
      name: "Test adventurer",
      locationId: "test-town",
      skills: [
        {
          id: "constitution",
          name: "Constitution",
          category: "combat",
          initialLevel: 10,
        },
        {
          id: "mining",
          name: "Mining",
          category: "gathering",
        },
      ],
    }),
  });
}
