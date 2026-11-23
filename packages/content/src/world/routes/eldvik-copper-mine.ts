import type { TravelRouteDefinition } from "@runemark/domain";

export const eldvikCopperMineRoute = {
  id: "eldvik-copper-mine-route",
  fromId: "eldvik",
  toId: "eldvik-copper-mine",
  durationMs: 45_000,
} satisfies TravelRouteDefinition;
