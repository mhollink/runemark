import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { gameContent } from "@runemark/content";
import type { OfflineReport } from "./offline-report";

interface Props {
  readonly report: OfflineReport;
  readonly onDismiss: () => void;
}

function formatAwayDuration(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / 60_000);
  const hours = Math.floor(minutes / 60);
  return hours > 0
    ? `${hours}h ${minutes % 60}m`
    : minutes > 0
      ? `${minutes}m`
      : `${Math.floor(milliseconds / 1000)}s`;
}

export function OfflineSummary({ report, onDismiss }: Props) {
  const { summary, events } = report;
  const items = Object.entries(summary.itemsGained);
  const experience = Object.entries(summary.experienceGained);
  return (
    <Dialog open onClose={onDismiss} fullWidth maxWidth="sm">
      <DialogTitle>While you were away</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography color="text.secondary">
            {formatAwayDuration(report.elapsedMs)} elapsed
          </Typography>
          <Stack direction="row" gap={4}>
            <BoxStat
              label="Actions completed"
              value={summary.completedActions}
            />
            <BoxStat label="Bank trips" value={summary.bankTrips} />
          </Stack>
          {items.length > 0 && (
            <>
              <Typography variant="h6">Resources collected</Typography>
              <List disablePadding>
                {items.map(([id, quantity]) => (
                  <ListItem key={id} disableGutters>
                    <ListItemText primary={gameContent.items[id]?.name ?? id} />
                    <Typography>+{quantity.toLocaleString()}</Typography>
                  </ListItem>
                ))}
              </List>
            </>
          )}
          {experience.length > 0 && (
            <>
              <Typography variant="h6">Experience gained</Typography>
              <List disablePadding>
                {experience.map(([id, xp]) => (
                  <ListItem key={id} disableGutters>
                    <ListItemText
                      primary={gameContent.skills[id]?.name ?? id}
                    />
                    <Typography>+{xp.toLocaleString()} XP</Typography>
                  </ListItem>
                ))}
              </List>
            </>
          )}
          {events.some((event) => event.type === "ACTIVITY_BLOCKED") && (
            <Alert severity="warning">
              Your activity was interrupted while you were away.
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onDismiss}>
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function BoxStat({
  label,
  value,
}: {
  readonly label: string;
  readonly value: number;
}) {
  return (
    <Stack>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5">{value.toLocaleString()}</Typography>
    </Stack>
  );
}
