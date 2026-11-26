import type { ActivitySiteDefinition } from "@runemark/domain";
import { goldvale } from "../region";

export const greenwood = {
  id: "goldvale-greenwood",
  name: "The Greenwoods",
  regionId: goldvale.id,
  activityIds: ["chop-oak", "fight-black-bear"],
} satisfies ActivitySiteDefinition;
