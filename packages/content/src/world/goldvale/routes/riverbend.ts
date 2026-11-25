import type { TravelRouteDefinition } from "@runemark/domain";

export const riverbendRoutes = [
  {
    id: "riverbend-to-oakridge",
    fromId: "riverbend",
    toId: "oakridge",
    durationMs: 4500,
  },

  {
    id: "riverbend-to-elden-river",
    fromId: "riverbend",
    toId: "elden-river",
    durationMs: 4000,
  },
  {
    id: "riverbend-to-riverbend-quarry",
    fromId: "riverbend",
    toId: "riverbend-quarry",
    durationMs: 2000,
  },
  {
    id: "riverbend-to-oakridge-woods",
    fromId: "riverbend",
    toId: "oakridge-woods",
    durationMs: 3000,
  },
  {
    id: "riverbend-to-copper-mine",
    fromId: "riverbend",
    toId: "goldvale-copper-mine",
    durationMs: 3000,
  },
] satisfies TravelRouteDefinition[];
