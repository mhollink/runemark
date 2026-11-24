import type { TravelRouteDefinition } from "@runemark/domain";

export const eldvikFarmRoute = {
  id: "eldvik-farm-route",
  fromId: "eldvik",
  toId: "eldvik-farm",
  durationMs: 15_000,
} satisfies TravelRouteDefinition;
