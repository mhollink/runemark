import { useContext } from "react";
import { useStore } from "zustand";
import type { GameStore } from "@/game";
import { GameContext } from "./game-context";

export const useGameStore = <T>(selector: (state: GameStore) => T): T => {
  const store = useContext(GameContext);

  if (!store) {
    throw new Error("useGameStore must be used within a GameProvider.");
  }

  return useStore(store, selector);
};
