import type { GameSaveRepository } from "./save-repository";

export function createInMemorySaveRepository(
  initialValue?: unknown,
): GameSaveRepository {
  let value = structuredClone(initialValue);

  return {
    load: async () => structuredClone(value),

    save: async (game) => {
      value = structuredClone(game);
    },

    remove: async () => {
      value = undefined;
    },
  };
}
