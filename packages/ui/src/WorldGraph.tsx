import { Box, ButtonBase, Paper, Stack, Typography } from "@mui/material";
import type { TravelRouteDefinition } from "@runemark/domain";

export interface GraphNode {
  readonly id: string;
  readonly name: string;
  readonly x: number;
  readonly y: number;
  readonly kind: "settlement" | "gathering" | "combat" | "mixed";
}

interface WorldGraphProps {
  readonly nodes: readonly GraphNode[];
  readonly routes: readonly TravelRouteDefinition[];
  readonly selectedNodeId: string;
  readonly currentNodeId: string;
  readonly activeRouteId: string | null;
  readonly onSelect: (nodeId: string) => void;
}

const colors = {
  settlement: "#d5ac70",
  gathering: "#83ba91",
  combat: "#d48080",
  mixed: "#7ea8db",
} as const;

export function WorldGraph({
  nodes,
  routes,
  selectedNodeId,
  currentNodeId,
  activeRouteId,
  onSelect,
}: WorldGraphProps) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  return (
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      <Box sx={{ overflowX: "auto" }}>
        <Box
          sx={{
            position: "relative",
            minWidth: 760,
            height: 510,
            bgcolor: "#16232b",
            backgroundImage:
              "radial-gradient(circle at 48% 45%, #223638, transparent 70%)",
          }}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
          >
            {routes.map((route) => {
              const from = byId.get(route.fromId);
              const to = byId.get(route.toId);
              if (!from || !to) return null;
              const active = route.id === activeRouteId;
              return (
                <line
                  key={route.id}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={active ? "#f1cb84" : "#819392"}
                  strokeWidth={active ? 3 : 1.5}
                  strokeDasharray={active ? undefined : "5 5"}
                  vectorEffect="non-scaling-stroke"
                >
                  <title>
                    {from.name} to {to.name}: {route.durationMs / 1000}s
                  </title>
                </line>
              );
            })}
          </svg>
          {nodes.map((node) => {
            const selected = node.id === selectedNodeId;
            const current = node.id === currentNodeId;
            return (
              <ButtonBase
                key={node.id}
                aria-label={`${node.name}${current ? ", current location" : ""}`}
                aria-pressed={selected}
                onClick={() => onSelect(node.id)}
                sx={{
                  position: "absolute",
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: "translate(-50%, -50%)",
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  zIndex: selected ? 2 : 1,
                  bgcolor: "#16232b",
                  outline: selected ? "2px solid #e5edf7" : "none",
                  outlineOffset: 3,
                  "&.Mui-focusVisible": {
                    outline: "3px solid #7ea8db",
                    outlineOffset: 3,
                  },
                }}
              >
                <Box
                  sx={{
                    width: node.kind === "settlement" ? 17 : 12,
                    height: node.kind === "settlement" ? 17 : 12,
                    borderRadius: node.kind === "settlement" ? 1 : "50%",
                    bgcolor: colors[node.kind],
                    boxShadow: current ? "0 0 0 4px #7ea8db" : "none",
                  }}
                />
                <Typography
                  component="span"
                  variant="caption"
                  sx={{
                    position: "absolute",
                    top: 33,
                    left: "50%",
                    transform: "translateX(-50%)",
                    whiteSpace: "nowrap",
                    bgcolor: "#16232b",
                    px: 0.5,
                    borderRadius: 0.5,
                    color: selected ? "#fff" : "#d5e0e0",
                    fontWeight: selected ? 700 : 500,
                  }}
                >
                  {node.name}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>
      </Box>
      <Stack direction="row" gap={2} flexWrap="wrap" sx={{ p: 1.5 }}>
        {Object.entries(colors).map(([kind, color]) => (
          <Stack key={kind} direction="row" alignItems="center" gap={0.75}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: kind === "settlement" ? 0.5 : "50%",
                bgcolor: color,
              }}
            />
            <Typography variant="caption" sx={{ textTransform: "capitalize" }}>
              {kind}
            </Typography>
          </Stack>
        ))}
        <Typography variant="caption" color="primary.main">
          Blue ring: current location
        </Typography>
      </Stack>
    </Paper>
  );
}
