import type { ActivitySiteDefinition } from "@runemark/domain";
import { goldvale } from "../region";

export const wolfClearing = {
  id: "goldvale-wolf-clearing",
  name: "Wolf Clearing",
  regionId: goldvale.id,
  activityIds: ["fight-wild-boar", "fight-grey-wolf", "fight-black-bear"],
} satisfies ActivitySiteDefinition;
