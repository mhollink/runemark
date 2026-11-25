import type { TravelRouteDefinition } from "@runemark/domain";

export const eldenvikRoutes = [
  {
    id: "eldenvik-to-greenhollow",
    fromId: "eldenvik",
    toId: "greenhollow",
    durationMs: 10_000,
  },
  {
    id: "eldenvik-to-riverbend",
    fromId: "eldenvik",
    toId: "riverbend",
    durationMs: 13_000,
  },
  {
    id: "eldenvik-to-sunmead",
    fromId: "eldenvik",
    toId: "sunmead",
    durationMs: 13_000,
  },
  {
    id: "eldenvik-to-oakridge",
    fromId: "eldenvik",
    toId: "oakridge",
    durationMs: 12_000,
  },

  {
    id: "eldenvik-to-willow-grove",
    fromId: "eldenvik",
    toId: "goldvale-willow-grove",
    durationMs: 5000,
  },
  {
    id: "eldenvik-to-copper-mine",
    fromId: "eldenvik",
    toId: "goldvale-copper-mine",
    durationMs: 6000,
  },
  {
    id: "eldenvik-to-elden-river",
    fromId: "eldenvik",
    toId: "elden-river",
    durationMs: 7500,
  },
  {
    id: "eldenvik-to-wolf-clearing",
    fromId: "eldenvik",
    toId: "goldvale-wolf-clearing",
    durationMs: 7000,
  },
] satisfies TravelRouteDefinition[];
