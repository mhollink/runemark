import type { TravelRouteDefinition } from "@runemark/domain";

export const eldvikBirchGroveRoute = {
  id: "eldvik-birch-grove-route",
  fromId: "eldvik",
  toId: "eldvik-birch-grove",
  durationMs: 35_000,
} satisfies TravelRouteDefinition;
