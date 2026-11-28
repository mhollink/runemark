import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { PropsWithChildren } from "react";
import {
  selectCommandError,
  selectDismissCommandError,
  selectDismissOfflineReport,
  selectGameStatus,
  selectOfflineReport,
  selectRuntimeError,
  selectStorageError,
  useGameStore,
} from "@/game";
import { RunemarkLogo } from "./RunemarkLogo";

type Props = PropsWithChildren<{
  readonly onReset: () => Promise<void>;
}>;

export function GameStateGate({ children, onReset }: Props) {
  const status = useGameStore(selectGameStatus);
  const runtimeError = useGameStore(selectRuntimeError);
  const storageError = useGameStore(selectStorageError);
  const commandError = useGameStore(selectCommandError);
  const offlineReport = useGameStore(selectOfflineReport);

  const dismissCommandError = useGameStore(selectDismissCommandError);

  const dismissOfflineReport = useGameStore(selectDismissOfflineReport);

  if (status === "loading") {
    return (
      <CenteredScreen>
        <Box sx={{ color: "primary.main" }}>
          <RunemarkLogo size={96} />
        </Box>

        <CircularProgress size={24} />

        <Typography color="textSecondary">Loading your adventure...</Typography>
      </CenteredScreen>
    );
  }

  if (status === "error") {
    return (
      <CenteredScreen>
        <Typography variant="h5">Unable to load Runemark</Typography>

        <Alert severity="error">{runtimeError}</Alert>

        <Button variant="contained" onClick={() => window.location.reload()}>
          Reload game
        </Button>

        <Button
          color="error"
          onClick={() => {
            if (window.confirm("Replace your existing save with a new game?")) {
              void onReset();
            }
          }}
        >
          Start a new game
        </Button>
      </CenteredScreen>
    );
  }

  return (
    <>
      {storageError && (
        <Alert severity="warning">
          Your progress could not be saved: {storageError}
        </Alert>
      )}

      {commandError && (
        <Alert severity="error" onClose={dismissCommandError}>
          {commandError}
        </Alert>
      )}

      {offlineReport && (
        <Alert severity="success" onClose={dismissOfflineReport}>
          While you were away, you completed{" "}
          {offlineReport.summary.completedActions} actions and gained{" "}
          {offlineReport.summary.coinsGained} coins.
        </Alert>
      )}

      {children}
    </>
  );
}

function CenteredScreen({ children }: PropsWithChildren) {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        p: 3,
      }}
    >
      <Stack
        spacing={3}
        sx={{
          alignItems: "center",
          textAlign: "center",
          maxWidth: 480,
        }}
      >
        {children}
      </Stack>
    </Box>
  );
}
