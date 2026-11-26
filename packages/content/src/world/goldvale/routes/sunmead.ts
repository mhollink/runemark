import type { TravelRouteDefinition } from "@runemark/domain";

export const sunmeadRoutes = [
  {
    id: "sunmead-to-sunfield-farm",
    fromId: "sunmead",
    toId: "goldvale-sunfield-farm",
    durationMs: 3000,
  },
  {
    id: "sunmead-to-willow-grove",
    fromId: "sunmead",
    toId: "goldvale-willow-grove",
    durationMs: 6500,
  },
  {
    id: "sunmead-to-sunmead-meadows",
    fromId: "sunmead",
    toId: "goldvale-sunmead-meadows",
    durationMs: 4500,
  },
  {
    id: "sunmead-to-greenwood",
    fromId: "sunmead",
    toId: "goldvale-greenwood",
    durationMs: 6000,
  },
] satisfies TravelRouteDefinition[];
