import type { GameContent } from "@runemark/content";
import type { GameSave } from "@runemark/domain";
import type { GameSaveRepository } from "./save-repository";
import { isGameSave } from "./save-validation";

export function createSaveManager(
  repository: GameSaveRepository,
  content: GameContent,
) {
  let pending: Promise<void> = Promise.resolve();

  const enqueue = <T>(operation: () => Promise<T>): Promise<T> => {
    const result = pending.then(operation);

    pending = result.then(
      () => undefined,
      () => undefined,
    );

    return result;
  };

  const load = (): Promise<GameSave | null> =>
    enqueue(async () => {
      const value = await repository.load();

      if (value === undefined) {
        return null;
      }

      if (!isGameSave(value, content)) {
        throw new Error("The saved game is invalid or incompatible.");
      }

      return value;
    });

  const save = (game: GameSave): Promise<void> =>
    enqueue(() => repository.save(game));
  const remove = (): Promise<void> => enqueue(() => repository.remove());
  const flush = (): Promise<void> => pending;

  return {
    load,
    save,
    remove,
    flush,
  };
}

export type SaveManager = ReturnType<typeof createSaveManager>;
