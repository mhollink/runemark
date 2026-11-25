import type { TravelRouteDefinition } from "@runemark/domain";

export const greenhollowRoutes = [
  {
    id: "greenhollow-to-greenwood",
    fromId: "greenhollow",
    toId: "greenwood",
    durationMs: 5000,
  },
  {
    id: "greenhollow-to-elden-river",
    fromId: "greenhollow",
    toId: "elden-river",
    durationMs: 6000,
  },
] satisfies TravelRouteDefinition[];
