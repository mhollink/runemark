import type { TravelRouteDefinition } from "@runemark/domain";

export const eldvikShoreRoute = {
  id: "eldvik-shore-route",
  fromId: "eldvik",
  toId: "eldvik-shore",
  durationMs: 30_000,
} satisfies TravelRouteDefinition;
