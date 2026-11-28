import { createStore, del, get, set } from "idb-keyval";
import type { GameSaveRepository } from "./save-repository";

const DATABASE_NAME = "runemark";
const STORE_NAME = "saves";
const SAVE_KEY = "primary";

export function createIndexedDbSaveRepository(
  databaseName = DATABASE_NAME,
): GameSaveRepository {
  let store: ReturnType<typeof createStore> | undefined;

  function getStore() {
    store ??= createStore(databaseName, STORE_NAME);
    return store;
  }

  return {
    load: async () => get<unknown>(SAVE_KEY, getStore()),
    save: async (game) => set(SAVE_KEY, game, getStore()),
    remove: async () => del(SAVE_KEY, getStore()),
  };
}
