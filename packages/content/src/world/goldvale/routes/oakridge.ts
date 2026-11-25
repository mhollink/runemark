import type { TravelRouteDefinition } from "@runemark/domain";

export const oakridgeRoutes = [
  {
    id: "oakridge-to-sunmead",
    fromId: "oakridge",
    toId: "sunmead",
    durationMs: 6000,
  },

  {
    id: "oakridge-to-coppermine",
    fromId: "oakridge",
    toId: "goldvale-copper-mine",
    durationMs: 2000,
  },
  {
    id: "oakridge-to-oakridge-woods",
    fromId: "oakridge",
    toId: "oakridge-woods",
    durationMs: 2000,
  },
  {
    id: "oakridge-to-old-barrow",
    fromId: "oakridge",
    toId: "old-barrow",
    durationMs: 4000,
  },
  {
    id: "oakridge-to-sunfield-farm",
    fromId: "oakridge",
    toId: "sunfield-farm",
    durationMs: 4000,
  },
] satisfies TravelRouteDefinition[];
