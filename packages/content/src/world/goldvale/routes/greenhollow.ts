import type { TravelRouteDefinition } from "@runemark/domain";

export const greenhollowRoutes = [
  {
    id: "greenhollow-to-greenwood",
    fromId: "greenhollow",
    toId: "goldvale-greenwood",
    durationMs: 4000,
  },
  {
    id: "greenhollow-to-elden-river",
    fromId: "greenhollow",
    toId: "goldvale-elden-river",
    durationMs: 6000,
  },

  // Movement to outlaw camp goes via the greenwood
  {
    id: "greenhollow-to-outlaw-camp",
    fromId: "goldvale-greenwood",
    toId: "goldvale-outlaw-camp",
    durationMs: 4000,
  },
] satisfies TravelRouteDefinition[];
