import type { ActivitySiteDefinition } from "@runemark/domain";
import { goldvale } from "../region";

export const sunmeadMeadows = {
  id: "goldvale-sunmead-meadows",
  name: "Sunmead Meadow",
  regionId: goldvale.id,
  activityIds: ["gather-elderberries", "gather-bilberries"],
} satisfies ActivitySiteDefinition;
