import type { TravelRouteDefinition } from "@runemark/domain";

export const greenhollowRoutes = [
  {
    id: "greenhollow-to-greenwood",
    fromId: "greenhollow",
    toId: "greenwood",
    durationMs: 2000,
  },
  {
    id: "greenhollow-to-elden-river",
    fromId: "greenhollow",
    toId: "elden-river",
    durationMs: 2000,
  },
] satisfies TravelRouteDefinition[];
