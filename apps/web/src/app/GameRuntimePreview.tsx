import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  selectActiveActivity,
  selectStartActivity,
  selectStopActivity,
  useGameStore,
} from "@/game";

export function GameRuntimePreview() {
  const activity = useGameStore(selectActiveActivity);
  const startActivity = useGameStore(selectStartActivity);
  const stopActivity = useGameStore(selectStopActivity);

  return (
    <Stack spacing={2} sx={{ alignItems: "center" }}>
      <Typography variant="h6">Runtime preview</Typography>

      {activity ? (
        <>
          <Typography>{activity.activityId}</Typography>

          <Typography color="textSecondary">
            {activity.status} · {activity.phase}
          </Typography>

          <Typography variant="caption">{activity.elapsedMs} ms</Typography>
        </>
      ) : (
        <Typography color="textSecondary">No active activity</Typography>
      )}

      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          disabled={
            activity?.activityId === "mine-copper" &&
            activity.status === "running"
          }
          onClick={() => startActivity("goldvale-copper-mine", "mine-copper")}
        >
          Mine copper
        </Button>

        <Button variant="outlined" disabled={!activity} onClick={stopActivity}>
          Stop
        </Button>
      </Stack>
    </Stack>
  );
}
