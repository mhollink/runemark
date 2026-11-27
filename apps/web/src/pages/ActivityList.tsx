import LockOutlined from "@mui/icons-material/LockOutlined";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { gameContent } from "@runemark/content";
import type { GameSave } from "@runemark/domain";
import { useState } from "react";
import {
  type ActivityOption,
  displayName,
  formatDuration,
  groupActivityOptions,
  unmetRequirements,
} from "../game/activity-catalog";

interface Props {
  readonly game: GameSave;
  readonly options: readonly ActivityOption[];
  readonly onStart: (nodeId: string, activityId: string) => void;
}

export function ActivityList({ game, options, onStart }: Props) {
  const [dialogActivityId, setDialogActivityId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const grouped = groupActivityOptions(options);
  const dialogOptions = options.filter(
    ({ activity }) => activity.id === dialogActivityId,
  );
  const selected = dialogOptions.find(({ node }) => node.id === selectedNodeId);
  const canStart =
    selected &&
    unmetRequirements(selected.activity, game.character.skills).length === 0 &&
    !(
      game.activeActivity?.status === "running" &&
      game.activeActivity.activityId === selected.activity.id &&
      game.activeActivity.nodeId === selected.node.id
    );
  function open(group: readonly ActivityOption[]) {
    const first = group[0];
    if (!first) return;
    setDialogActivityId(first.activity.id);
    setSelectedNodeId(
      group.find(({ node }) => node.id === game.character.nodeId)?.node.id ??
        first.node.id,
    );
  }
  function close() {
    setDialogActivityId(null);
    setSelectedNodeId(null);
  }
  if (!options.length)
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography color="textSecondary">
          No activities available here yet.
        </Typography>
      </Paper>
    );
  return (
    <Stack spacing={1.5}>
      {grouped.map((group) => {
        const first = group[0];
        if (!first) return null;
        const { activity } = first;
        const locked =
          unmetRequirements(activity, game.character.skills).length > 0;
        const active =
          game.activeActivity?.activityId === activity.id &&
          game.activeActivity.status === "running" &&
          group.some(({ node }) => node.id === game.activeActivity?.nodeId);
        return (
          <Paper
            key={activity.id}
            variant="outlined"
            sx={{ p: 2, borderColor: active ? "success.main" : "divider" }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              sx={{alignItems: { xs: "stretch", sm: "center"}, gap: 2}}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack
                  direction="row"
                  sx={{
                    gap: 1,
                    flexWrap: "wrap",
                    alignItems: "center"
                  }}
                >
                  <Typography variant="h6" sx={{fontSize: "1rem"}}>
                    {activity.name}
                  </Typography>
                  {active && (
                    <Chip color="success" size="small" label="Active" />
                  )}
                  {locked && <LockOutlined fontSize="small" color="disabled" />}
                </Stack>
                <Typography variant="body2" color="textSecondary">
                  {activity.kind === "combat"
                    ? "Combat"
                    : `${formatDuration(activity.durationMs)} per action · ${activity.experiencePerAction} XP`}{" "}
                  ·{" "}
                  {group.length === 1
                    ? first.node.name
                    : `${group.length} locations`}
                </Typography>
                {(activity.requirements ?? []).length > 0 && (
                  <Typography
                    variant="caption"
                    color={locked ? "warning" : "textSecondary"}
                  >
                    {activity.requirements
                      ?.map(
                        ({ skillId, level }) =>
                          `${gameContent.skills[skillId]?.name ?? displayName(skillId)} ${level}`,
                      )
                      .join(" · ")}
                  </Typography>
                )}
              </Box>
              <Button variant="outlined" onClick={() => open(group)}>
                View activity
              </Button>
            </Stack>
          </Paper>
        );
      })}
      <Dialog
        open={dialogActivityId !== null}
        onClose={close}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {dialogOptions[0]?.activity.name ?? "Activity"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="body2" color="textSecondary">
              Select a location. Travel and banking are handled automatically.
            </Typography>
            <List disablePadding>
              {dialogOptions.map(({ node }) => (
                <ListItemButton
                  key={node.id}
                  selected={selectedNodeId === node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemText
                    primary={node.name}
                    secondary={
                      gameContent.regions[node.regionId]?.name ?? node.regionId
                    }
                  />
                </ListItemButton>
              ))}
            </List>
            {selected && selected.activity.kind === "production" && (
              <Box>
                <Typography variant="subtitle2">
                  Ingredients per action
                </Typography>
                {selected.activity.inputs.map(({ itemId, quantity }) => (
                  <Typography key={itemId} variant="body2">
                    {quantity} × {gameContent.items[itemId]?.name ?? itemId}
                  </Typography>
                ))}
              </Box>
            )}
            {selected && selected.activity.kind === "combat" && (
              <Typography variant="body2" color="text.secondary">
                Monster HP:{" "}
                {gameContent.monsters[selected.activity.monsterId]?.combat
                  .maxHitpoints ?? "Unknown"}
              </Typography>
            )}
            {selected &&
              unmetRequirements(selected.activity, game.character.skills).map(
                ({ skillId, level }) => (
                  <Typography
                    key={skillId}
                    variant="body2"
                    color="warning"
                  >
                    Requires{" "}
                    {gameContent.skills[skillId]?.name ?? displayName(skillId)}{" "}
                    level {level}.
                  </Typography>
                ),
              )}
            {game.activeActivity?.status === "running" && canStart && (
              <Typography variant="body2" color="textSecondary">
                Starting will replace your current activity.
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!canStart}
            onClick={() => {
              if (!selected || !canStart) return;
              onStart(selected.node.id, selected.activity.id);
              close();
            }}
          >
            Start activity
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
