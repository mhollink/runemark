import type { ActivitySiteDefinition } from "@runemark/domain";
import { goldvale } from "../region";

export const oakridgeWoods = {
  id: "oakridge-woods",
  name: "Oakridge Woods",
  regionId: goldvale.id,
  activityIds: ["chop-oak", "chop-birch", "fight-wild-boar"],
} satisfies ActivitySiteDefinition;
