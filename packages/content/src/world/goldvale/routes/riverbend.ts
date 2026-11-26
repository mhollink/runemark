import type { TravelRouteDefinition } from "@runemark/domain";

export const riverbendRoutes = [
  {
    id: "riverbend-to-elden-river",
    fromId: "riverbend",
    toId: "goldvale-elden-river",
    durationMs: 5000,
  },
  {
    id: "riverbend-to-riverbend-quarry",
    fromId: "riverbend",
    toId: "goldvale-riverbend-quarry",
    durationMs: 3500,
  },
  {
    id: "riverbend-to-oakridge-woods",
    fromId: "riverbend",
    toId: "goldvale-oakridge-woods",
    durationMs: 6500,
  },
  {
    id: "riverbend-to-wolf-clearing",
    fromId: "riverbend",
    toId: "goldvale-wolf-clearing",
    durationMs: 5000,
  },
] satisfies TravelRouteDefinition[];
