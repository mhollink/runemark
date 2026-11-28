import { createStore, del, get, set } from "idb-keyval";
import type { GameSaveRepository } from "./save-repository";

const DATABASE_NAME = "runemark";
const STORE_NAME = "saves";
const SAVE_KEY = "primary";

export function createIndexedDbSaveRepository(
  databaseName = DATABASE_NAME,
): GameSaveRepository {
  const store = createStore(databaseName, STORE_NAME);

  return {
    load: () => get<unknown>(SAVE_KEY, store),
    save: (game) => set(SAVE_KEY, game, store),
    remove: () => del(SAVE_KEY, store),
  };
}
