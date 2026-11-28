export { createGameApplication } from "./create-game-application";
export { createIndexedDbSaveRepository } from "./persistence/indexed-db-save-repository";
export {
  createSaveManager,
  type SaveManager,
} from "./persistence/save-manager";
export type { GameRuntime } from "./runtime/game-runtime";
export {
  SAVE_INTERVAL_MS,
  SIMULATION_INTERVAL_MS,
} from "./runtime/runtime-config";
export { GameProvider } from "./store/GameProvider";
export * from "./store/game-selectors";
export {
  createGameStore,
  type GameStore,
  type GameStoreApi,
  type GameStoreDependencies,
} from "./store/game-store";
export { useGameStore } from "./store/use-game-store";
