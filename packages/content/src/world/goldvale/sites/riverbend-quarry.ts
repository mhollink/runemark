import type { ActivitySiteDefinition } from "@runemark/domain";
import { goldvale } from "../region";

export const riverbendQuarry = {
  id: "goldvale-riverbend-quarry",
  name: "Riverbend Quarry",
  regionId: goldvale.id,
  activityIds: ["mine-zinc", "mine-iron"],
} satisfies ActivitySiteDefinition;
