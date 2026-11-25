import type { TravelRouteDefinition } from "@runemark/domain";

export const sunmeadRoutes = [
  {
    id: "sunmead-to-sunfield-farm",
    fromId: "sunmead",
    toId: "sunfied-farm",
    durationMs: 1000,
  },
  {
    id: "sunmead-to-willow-grove",
    fromId: "sunmead",
    toId: "goldvale-willow-grove",
    durationMs: 3000,
  },
  {
    id: "sunmead-to-sunmead-meadows",
    fromId: "sunmead",
    toId: "sunmead-meadows",
    durationMs: 2000,
  },
  {
    id: "sunmead-to-greenwood",
    fromId: "sunmead",
    toId: "greenwood",
    durationMs: 4000,
  },
] satisfies TravelRouteDefinition[];
