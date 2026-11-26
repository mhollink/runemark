import type { ActivitySiteDefinition } from "@runemark/domain";
import { goldvale } from "../region";

export const sunfieldFarm = {
  id: "goldvale-sunfield-farm",
  name: "Sunfield Farm",
  regionId: goldvale.id,
  activityIds: ["gather-wheat", "fight-chicken", "fight-cow"],
} satisfies ActivitySiteDefinition;
