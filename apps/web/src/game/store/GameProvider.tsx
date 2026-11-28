import type { PropsWithChildren } from "react";
import { GameContext } from "./game-context";
import type { GameStoreApi } from "./game-store";

type Props = PropsWithChildren<{
  readonly store: GameStoreApi;
}>;

export const GameProvider = ({ store, children }: Props) => (
  <GameContext.Provider value={store}>{children}</GameContext.Provider>
);
