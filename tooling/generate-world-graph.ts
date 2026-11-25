import { mkdirSync, writeFileSync } from "node:fs";
import { gameContent } from "../packages/content/src";
import {
  findShortestRoute,
  routeDuration,
} from "../packages/engine/src/navigation/find-route";
import { worldPositions } from "./world-layouts";

// script to run with "pnpm world:graph goldvale" or any other region.
// creates a .dot file usable with graphviz
// see: https://dreampuf.github.io/GraphvizOnline/

const regionId = process.argv[2];

const locations = Object.values(gameContent.locations);
const sites = Object.values(gameContent.sites);
const routes = Object.values(gameContent.routes);

if (regionId && !gameContent.regions[regionId]) {
  throw new Error(`Unknown region: ${regionId}`);
}

const nodes = [
  ...locations.map((location) => ({
    id: location.id,
    name: location.name,
    regionId: location.regionId,
    kind: "location",
  })),
  ...sites.map((site) => ({
    id: site.id,
    name: site.name,
    regionId: site.regionId,
    kind: "site",
  })),
];

const selectedNodes = nodes.filter(
  (node) => !regionId || node.regionId === regionId,
);
const fixedLayout = selectedNodes.every(
  (node) => worldPositions[node.id] !== undefined,
);

const selectedIds = new Set(selectedNodes.map((node) => node.id));

const allIds = new Set(nodes.map((node) => node.id));

for (const route of routes) {
  if (!allIds.has(route.fromId) || !allIds.has(route.toId)) {
    throw new Error(`Invalid route: ${route.id}`);
  }
}

const selectedRoutes = routes.filter(
  (route) => selectedIds.has(route.fromId) && selectedIds.has(route.toId),
);

const quote = (value: string) => JSON.stringify(value);

type Route = (typeof routes)[number];

function analyseRoute(route: Route) {
  const remainingRoutes = { ...gameContent.routes };
  delete remainingRoutes[route.id];

  const alternative = findShortestRoute(
    {
      ...gameContent,
      routes: remainingRoutes,
    },
    route.fromId,
    route.toId,
  );

  const alternativeMs =
    alternative === null ? Infinity : routeDuration(alternative);

  const status =
    alternativeMs < route.durationMs
      ? "redundant"
      : alternativeMs === route.durationMs
        ? "equivalent"
        : "optimal";

  return {
    status,
    alternative,
    alternativeMs,
  };
}

const routeStyles = {
  optimal: {
    color: "#68985F",
    style: "solid",
  },
  equivalent: {
    color: "#C28C45",
    style: "dashed",
  },
  redundant: {
    color: "#C84949",
    style: "dashed",
  },
} as const;

const dot = [
  "graph World {",

  `graph [
    layout=neato,
    overlap=${fixedLayout ? "true" : "false"},
    splines=true,
    start=42,
    bgcolor=transparent,
    pad=0.5
  ];`,

  `node [
    fontname="Arial",
    fontsize=12,
    style="filled,rounded",
    shape=box,
    fontcolor=white,
    color=transparent,
    margin="0.2,0.12"
  ];`,

  `edge [
    fontname="Arial",
    fontsize=10,
    penwidth=2
  ];`,

  ...selectedNodes.map((node) => {
    const color = node.kind === "location" ? "#315D88" : "#3C6045";

    const position = fixedLayout ? worldPositions[node.id] : undefined;

    const positioning = position
      ? `pos="${position.join(",")}!", pin=true`
      : "";

    return `${quote(node.id)} [
    label=${quote(node.name)},
    fillcolor="${color}"
    ${positioning ? `, ${positioning}` : ""}
  ];`;
  }),

  ...selectedRoutes.map((route) => {
    const { status, alternativeMs } = analyseRoute(route);
    const { color, style } = routeStyles[status];

    const seconds = route.durationMs / 1000;

    const label =
      status === "redundant"
        ? `${seconds}s (${alternativeMs / 1000}s alt.)`
        : `${seconds}s`;

    return `${quote(route.fromId)} -- ${quote(route.toId)} [
    label=${quote(label)},
    color="${color}",
    fontcolor="${color}",
    style="${style}"
  ];`;
  }),

  "}",
].join("\n");

const directory = "generated/world";
const filename = `${directory}/${regionId ?? "world"}`;

mkdirSync(directory, { recursive: true });
writeFileSync(`${filename}.dot`, dot);

console.log(`${selectedNodes.length} nodes, ${selectedRoutes.length} routes`);
