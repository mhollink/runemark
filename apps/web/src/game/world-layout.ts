import {gameContent} from "@runemark/content";
import type {GraphNode} from "@runemark/ui";
import {activityCatalog} from "./activity-catalog";

// Presentation coordinates only. The engine's travel time never depends on these.
const goldvaleCoordinates: Readonly<Record<string, readonly [number, number]>> =
    {
        greenhollow: [20, 17],
        riverbend: [75, 20],
        eldenvik: [45, 45],
        oakridge: [68, 70],
        sunmead: [16, 67],

        "goldvale-copper-mine": [59, 49],
        "goldvale-elden-river": [45, 24],
        "goldvale-willow-grove": [35, 53],
        "goldvale-wolf-clearing": [60, 28],
        "goldvale-greenwood": [20, 35],
        "goldvale-outlaw-camp": [10, 26],
        "goldvale-riverbend-quarry": [80, 8],
        "goldvale-oakridge-woods": [85, 40],
        "goldvale-old-barrow": [92, 80],
        "goldvale-sunfield-farm": [34, 78],
        "goldvale-sunmead-meadows": [13, 82],
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
                .map(({activity}) => activity.kind),
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
