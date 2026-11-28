import type { PropsWithChildren } from "react";
import type { GameStoreApi } from "@/game";
import { GameContext } from "./game-context";

type Props = PropsWithChildren<{
  readonly store: GameStoreApi;
}>;

export const GameProvider = ({ store, children }: Props) => (
  <GameContext.Provider value={store}>{children}</GameContext.Provider>
);
