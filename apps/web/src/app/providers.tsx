import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { executeCommand } from "@runemark/engine";
import { type PropsWithChildren, useState } from "react";
import { createGameStore, GameProvider } from "@/game";
import { createInitialGame } from "@/game/runtime/create-initial-game";
import { theme } from "./theme/theme";

export function AppProviders({ children }: PropsWithChildren) {
  const [store] = useState(() =>
    createGameStore(
      {
        now: Date.now,
        execute: executeCommand,
      },
      createInitialGame(),
    ),
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <GameProvider store={store}>{children}</GameProvider>
    </ThemeProvider>
  );
}
