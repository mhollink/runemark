import type { ActivitySiteDefinition } from "@runemark/domain";
import { goldvale } from "../region";

export const willowGrove = {
  id: "goldvale-willow-grove",
  name: "Willow Grove",
  regionId: goldvale.id,
  activityIds: ["cut-willow"],
} satisfies ActivitySiteDefinition;
