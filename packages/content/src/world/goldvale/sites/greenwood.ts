import type { ActivitySiteDefinition } from "@runemark/domain";
import { goldvale } from "../region";

export const greenwood = {
  id: "greenwood",
  name: "The Greenwoods",
  regionId: goldvale.id,
  activityIds: ["cut-oak", "fight-black-bear"],
} satisfies ActivitySiteDefinition;
