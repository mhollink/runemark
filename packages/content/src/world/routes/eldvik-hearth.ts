import type { TravelRouteDefinition } from "@runemark/domain";

export const eldvikHearthRoute = {
  id: "eldvik-hearth-route",
  fromId: "eldvik",
  toId: "eldvik-hearth",
  durationMs: 12_000,
} satisfies TravelRouteDefinition;
