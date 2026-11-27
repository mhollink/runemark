import LocationCity from "@mui/icons-material/LocationCity";
import Place from "@mui/icons-material/Place";
import {
  Box,
  Chip,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { gameContent } from "@runemark/content";
import type { GameSave } from "@runemark/domain";
import { WorldGraph } from "@runemark/ui";
import { useState } from "react";
import {
  activityCatalog,
  displayName,
  formatDuration,
} from "../game/activity-catalog";
import { regionalGraphNodes } from "../game/world-layout";
import { ActivityList } from "./ActivityList";

interface Props {
  readonly game: GameSave;
  readonly onStart: (nodeId: string, activityId: string) => void;
}
const allNodes = [
  ...Object.values(gameContent.locations),
  ...Object.values(gameContent.sites),
];
const routes = Object.values(gameContent.routes);

export function WorldPage({ game, onStart }: Props) {
  const currentNode =
    gameContent.locations[game.character.nodeId] ??
    gameContent.sites[game.character.nodeId];
  const [regionId, setRegionId] = useState(
    currentNode?.regionId ?? Object.values(gameContent.regions)[0]?.id ?? "",
  );
  const [selectedNodeId, setSelectedNodeId] = useState(currentNode?.id ?? "");
  const [view, setView] = useState<"map" | "list">("map");
  const nodes = allNodes.filter((node) => node.regionId === regionId);
  const selectedNode =
    nodes.find(({ id }) => id === selectedNodeId) ?? nodes[0];
  const graphNodes = regionalGraphNodes(regionId);
  const currentLeg =
    game.activeActivity?.travel?.legs[game.activeActivity.travel.index];
  const facilities = selectedNode
    ? (gameContent.locations[selectedNode.id]?.facilities ?? [])
    : [];
  const connections = selectedNode
    ? routes.filter(
        ({ fromId, toId }) =>
          fromId === selectedNode.id || toId === selectedNode.id,
      )
    : [];
  const localRegion = currentNode?.regionId;
  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{
          justifyContent: "space-between",
          gap: 2
        }}
      >
        <Box>
          <Typography variant="h4">World</Typography>
          <Typography variant="body2" color="text.secondary">
            Explore settlements, sites and their connections.
          </Typography>
        </Box>
        <Stack direction="row" sx={{gap: 1}}>
          <TextField
            select
            label="Region"
            value={regionId}
            onChange={(event) => {
              setRegionId(event.target.value);
              setSelectedNodeId("");
            }}
            sx={{ minWidth: 140 }}
          >
            {Object.values(gameContent.regions).map((region) => (
              <MenuItem key={region.id} value={region.id}>
                {region.name}
              </MenuItem>
            ))}
          </TextField>
          <ToggleButtonGroup
            exclusive
            value={graphNodes ? view : "list"}
            onChange={(_, value: "map" | "list" | null) => {
              if (value) setView(value);
            }}
            aria-label="World view"
          >
            <ToggleButton value="map" disabled={!graphNodes}>
              Map
            </ToggleButton>
            <ToggleButton value="list">List</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>
      {graphNodes && view === "map" ? (
        <WorldGraph
          nodes={graphNodes}
          routes={routes}
          selectedNodeId={selectedNode?.id ?? ""}
          currentNodeId={game.character.nodeId}
          activeRouteId={currentLeg?.routeId ?? null}
          onSelect={setSelectedNodeId}
        />
      ) : (
        <Paper variant="outlined">
          <List>
            {nodes.map((node) => (
              <ListItemButton
                key={node.id}
                selected={node.id === selectedNode?.id}
                onClick={() => setSelectedNodeId(node.id)}
              >
                <ListItemIcon>
                  {gameContent.locations[node.id] ? (
                    <LocationCity />
                  ) : (
                    <Place />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={node.name}
                  secondary={
                    gameContent.locations[node.id]
                      ? "Settlement"
                      : "Activity site"
                  }
                />
                {node.id === game.character.nodeId && (
                  <Chip size="small" color="primary" label="Current location" />
                )}
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}
      {selectedNode && (
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <Stack direction="row" sx={{alignItems: "center", flexWrap: "wrap", gap: 1}}>
              <Typography variant="h5">{selectedNode.name}</Typography>
              {selectedNode.id === game.character.nodeId && (
                <Chip size="small" color="primary" label="Current location" />
              )}
            </Stack>
            {facilities.length > 0 && (
              <Stack direction="row" sx={{flexWrap: "wrap", gap: 1}}>
                {facilities.map((facility) => (
                  <Chip
                    key={facility}
                    size="small"
                    variant="outlined"
                    label={displayName(facility)}
                  />
                ))}
              </Stack>
            )}
            <Typography variant="subtitle2">Connected routes</Typography>
            <Stack direction="row" sx={{flexWrap: "wrap", gap: 1}}>
              {connections.map((route) => {
                const otherId =
                  route.fromId === selectedNode.id ? route.toId : route.fromId;
                const other = allNodes.find(({ id }) => id === otherId);
                return (
                  <Chip
                    key={route.id}
                    label={`${other?.name ?? otherId} · ${formatDuration(route.durationMs)}`}
                    onClick={() => {
                      if (other) {
                        setRegionId(other.regionId);
                        setSelectedNodeId(other.id);
                      }
                    }}
                  />
                );
              })}
            </Stack>
            <Typography variant="h6">Activities</Typography>
            {regionId === localRegion ? (
              <ActivityList
                key={selectedNode.id}
                game={game}
                options={activityCatalog.filter(
                  ({ node }) => node.id === selectedNode.id,
                )}
                onStart={onStart}
              />
            ) : (
              <Typography color="textSecondary">
                Starting activities in other regions is not enabled in this
                first UI increment.
              </Typography>
            )}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
