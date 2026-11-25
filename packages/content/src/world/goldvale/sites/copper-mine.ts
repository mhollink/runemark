import type { ActivitySiteDefinition } from "@runemark/domain";
import { goldvale } from "../region";

export const copperMine = {
  id: "goldvale-copper-mine",
  regionId: goldvale.id,
  name: "Copper Mine",
  activityIds: ["mine-copper"],
} satisfies ActivitySiteDefinition;
