import type { ActivitySiteDefinition } from "@runemark/domain";
import { goldvale } from "../region";

export const riverbendQuarry = {
  id: "riverbend-quarry",
  name: "Riverbend Quarry",
  regionId: goldvale.id,
  activityIds: ["mine-iron", "mine-coal"],
} satisfies ActivitySiteDefinition;
