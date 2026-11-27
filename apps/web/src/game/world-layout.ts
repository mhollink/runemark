import { gameContent } from "@runemark/content";
import type { GraphNode } from "@runemark/ui";
import { activityCatalog } from "./activity-catalog";

// Presentation coordinates only. The engine's travel time never depends on these.
const goldvaleCoordinates: Readonly<Record<string, readonly [number, number]>> =
  {
    riverbend: [13, 35],
    eldenvik: [46, 34],
    oakridge: [78, 20],
    greenhollow: [20, 67],
    sunmead: [76, 67],
    "goldvale-copper-mine": [61, 10],
    "goldvale-elden-river": [28, 14],
    "goldvale-willow-grove": [60, 53],
    "goldvale-wolf-clearing": [29, 43],
    "goldvale-greenwood": [45, 75],
    "goldvale-outlaw-camp": [19, 88],
    "goldvale-riverbend-quarry": [8, 8],
    "goldvale-oakridge-woods": [45, 8],
    "goldvale-old-barrow": [92, 8],
    "goldvale-sunfield-farm": [90, 43],
    "goldvale-sunmead-meadows": [87, 88],
  };

export function regionalGraphNodes(
  regionId: string,
): readonly GraphNode[] | null {
  const nodes = [
    ...Object.values(gameContent.locations),
    ...Object.values(gameContent.sites),
  ].filter((node) => node.regionId === regionId);
  // New regions/sites remain accessible via the list until they receive coordinates.
  if (
    regionId !== "goldvale" ||
    nodes.some((node) => !goldvaleCoordinates[node.id])
  )
    return null;
  return nodes.flatMap((node) => {
    const coordinates = goldvaleCoordinates[node.id];
    if (!coordinates) return [];
    const kinds = new Set(
      activityCatalog
        .filter((option) => option.node.id === node.id)
        .map(({ activity }) => activity.kind),
    );
    const kind = gameContent.locations[node.id]
      ? "settlement"
      : kinds.size > 1
        ? "mixed"
        : kinds.has("combat")
          ? "combat"
          : "gathering";
    return [
      {
        id: node.id,
        name: node.name,
        x: coordinates[0],
        y: coordinates[1],
        kind,
      },
    ];
  });
}
