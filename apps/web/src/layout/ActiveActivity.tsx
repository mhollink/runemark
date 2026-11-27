import AccountBalance from "@mui/icons-material/AccountBalance";
import Autorenew from "@mui/icons-material/Autorenew";
import DirectionsWalk from "@mui/icons-material/DirectionsWalk";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Stop from "@mui/icons-material/Stop";
import {
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { gameContent } from "@runemark/content";
import type { GameSave } from "@runemark/domain";
import { useState } from "react";
import { formatDuration } from "../game/activity-catalog";
import { activeActivityPresentation } from "../game/activity-presentation";

interface Props {
  readonly game: GameSave;
  readonly onStop: () => void;
}

export function ActiveActivity({ game, onStop }: Props) {
  const [expanded, setExpanded] = useState(false);
  const activity = activeActivityPresentation(game);
  if (!activity)
    return (
      <Paper variant="outlined" sx={{ px: 2, py: 1.5 }}>
        <Typography color="text.secondary" variant="body2">
          No active activity. Select a skill or a world site to begin.
        </Typography>
      </Paper>
    );
  const monster =
    activity.activity.kind === "combat"
      ? gameContent.monsters[activity.activity.monsterId]
      : undefined;
  const fighting = activity.phase === "work" && monster !== undefined;
  return (
    <Paper variant="outlined" sx={{ p: 1.5, flexShrink: 0 }}>
      <Stack direction="row" alignItems="center" gap={1.5}>
        <Box
          sx={{
            color: activity.blocked ? "error.main" : "primary.main",
            display: { xs: "none", sm: "block" },
          }}
        >
          <Autorenew />
        </Box>
        <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
            <Typography fontWeight={650}>{activity.activity.name}</Typography>
            {activity.blocked && (
              <Chip size="small" color="error" label="Blocked" />
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {activity.node?.name} ·{" "}
            {activity.blocked ? "Activity interrupted" : activity.phaseLabel}
            {!activity.blocked && activity.durationMs > 0
              ? ` · ${formatDuration(activity.remainingMs)}`
              : ""}
          </Typography>
          {activity.durationMs > 0 && !activity.blocked && (
            <LinearProgress
              aria-label="Current phase progress"
              variant="determinate"
              value={activity.progress}
              color="success"
            />
          )}
          {fighting && !activity.blocked && (
            <LinearProgress
              aria-label="Monster health"
              variant="determinate"
              value={Math.max(
                0,
                Math.min(
                  100,
                  (100 *
                    (activity.combat?.monsterHitpoints ??
                      monster.combat.maxHitpoints)) /
                    monster.combat.maxHitpoints,
                ),
              )}
              color="error"
            />
          )}
        </Stack>
        <Button
          size="small"
          color="error"
          variant="outlined"
          onClick={onStop}
          startIcon={<Stop />}
        >
          Stop
        </Button>
        <IconButton
          aria-label={
            expanded ? "Collapse activity details" : "Expand activity details"
          }
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          <ExpandMore
            sx={{ transform: expanded ? "rotate(180deg)" : "none" }}
          />
        </IconButton>
      </Stack>
      <Collapse in={expanded}>
        <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 2 }}>
          <Chip
            icon={<DirectionsWalk />}
            label="Travel"
            color={activity.phase === "travel" ? "primary" : "default"}
          />
          <Chip
            icon={<Autorenew />}
            label="Work"
            color={activity.phase === "work" ? "primary" : "default"}
          />
          <Chip
            icon={<AccountBalance />}
            label="Bank"
            color={activity.phase === "bank" ? "primary" : "default"}
          />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          Backpack: {game.character.backpack.slots.length}/
          {game.character.backpack.capacity} slots
          {activity.leg
            ? ` · Route: ${gameContent.locations[activity.leg.toId]?.name ?? gameContent.sites[activity.leg.toId]?.name ?? activity.leg.toId}`
            : ""}
        </Typography>
      </Collapse>
    </Paper>
  );
}
