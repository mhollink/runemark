import type { ActivitySiteDefinition } from "@runemark/domain";
import { goldvale } from "../region";

export const eldenRiver = {
  id: "goldvale-elden-river",
  name: "Elden River",
  regionId: goldvale.id,
  activityIds: ["catch-herring", "catch-pike", "catch-bream"],
} satisfies ActivitySiteDefinition;
