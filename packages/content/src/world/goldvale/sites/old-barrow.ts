import type { ActivitySiteDefinition } from "@runemark/domain";
import { goldvale } from "../region";

export const oldBarrow = {
  id: "old-barrow",
  name: "The Old Barrow",
  regionId: goldvale.id,
  activityIds: ["fight-skeleton", "fight-zombie", "fight-drauger"],
} satisfies ActivitySiteDefinition;
