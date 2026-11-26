import type { TravelRouteDefinition } from "@runemark/domain";

export const oakridgeRoutes = [
  {
    id: "oakridge-to-sunmead",
    fromId: "oakridge",
    toId: "sunmead",
    durationMs: 10_000,
  },

  {
    id: "oakridge-to-coppermine",
    fromId: "oakridge",
    toId: "goldvale-copper-mine",
    durationMs: 6500,
  },
  {
    id: "oakridge-to-oakridge-woods",
    fromId: "oakridge",
    toId: "goldvale-oakridge-woods",
    durationMs: 4500,
  },
  {
    id: "oakridge-to-old-barrow",
    fromId: "oakridge",
    toId: "goldvale-old-barrow",
    durationMs: 14_500,
  },
  {
    id: "oakridge-to-sunfield-farm",
    fromId: "oakridge",
    toId: "goldvale-sunfield-farm",
    durationMs: 9000,
  },
] satisfies TravelRouteDefinition[];
