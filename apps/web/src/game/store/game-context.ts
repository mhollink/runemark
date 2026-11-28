import { createContext } from "react";
import type { GameStoreApi } from "./game-store";

export const GameContext = createContext<GameStoreApi | null>(null);
