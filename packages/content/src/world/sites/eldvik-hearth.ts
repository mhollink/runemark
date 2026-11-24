import type { ActivitySiteDefinition } from "@runemark/domain";

export const eldvikHearth = {
  id: "eldvik-hearth",
  locationId: "eldvik",
  name: "Eldvik Hearth",
  activityIds: ["cook-herring", "cook-chicken"],
} satisfies ActivitySiteDefinition;
