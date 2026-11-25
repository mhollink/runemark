import type { TravelRouteDefinition } from "@runemark/domain";

export const eldenvikRoutes = [
  {
    id: "eldenvik-to-riverbend",
    fromId: "eldenvik",
    toId: "riverbend",
    durationMs: 4000,
  },
  {
    id: "eldenvik-to-greenhollow",
    fromId: "eldenvik",
    toId: "greenhollow",
    durationMs: 3000,
  },
  {
    id: "eldenvik-to-sunmead",
    fromId: "eldenvik",
    toId: "sunmead",
    durationMs: 3000,
  },
  {
    id: "eldenvik-to-oakridge",
    fromId: "eldenvik",
    toId: "oakridge",
    durationMs: 5000,
  },

  {
    id: "eldenvik-to-willow-grove",
    fromId: "eldenvik",
    toId: "goldvale-willow-grove",
    durationMs: 1000,
  },
  {
    id: "eldenvik-to-copper-mine",
    fromId: "eldenvik",
    toId: "goldvale-copper-mine",
    durationMs: 2500,
  },
  {
    id: "eldenvik-to-elden-river",
    fromId: "eldenvik",
    toId: "elden-river",
    durationMs: 3500,
  },
] satisfies TravelRouteDefinition[];
