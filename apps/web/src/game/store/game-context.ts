import { createContext } from "react";
import type { GameStoreApi } from "@/game";

export const GameContext = createContext<GameStoreApi | null>(null);
