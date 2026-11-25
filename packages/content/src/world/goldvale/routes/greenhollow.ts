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
  {
    id: "greenhollow-to-wolf-clearing",
    fromId: "greenhollow",
    toId: "goldvale-wolf-clearing",
    durationMs: 7000,
  },
  {
    id: "greenhollow-to-outlaw-camp",
    fromId: "greenhollow",
    toId: "goldvale-outlaw-camp",
    durationMs: 8000,
  },
] satisfies TravelRouteDefinition[];
