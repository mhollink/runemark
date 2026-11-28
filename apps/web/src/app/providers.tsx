import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { type PropsWithChildren, useState } from "react";
import { createGameApplication, GameProvider } from "@/game";
import { GameRuntimeController } from "./GameRuntimeController";
import { GameStateGate } from "./GameStateGate";
import { theme } from "./theme/theme";

export function AppProviders({ children }: PropsWithChildren) {
  const [runtime] = useState(createGameApplication);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <GameProvider store={runtime.store}>
        <GameRuntimeController runtime={runtime} />

        <GameStateGate onReset={runtime.reset}>{children}</GameStateGate>
      </GameProvider>
    </ThemeProvider>
  );
}
