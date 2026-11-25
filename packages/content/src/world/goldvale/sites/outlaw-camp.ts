import type { ActivitySiteDefinition } from "@runemark/domain";
import { goldvale } from "../region";

export const outlawCamp = {
  id: "goldvale-outlaw-camp",
  name: "Outlaw encampment",
  regionId: goldvale.id,
  activityIds: ["fight-outlaw", "fight-outlaw-leader"],
} satisfies ActivitySiteDefinition;
