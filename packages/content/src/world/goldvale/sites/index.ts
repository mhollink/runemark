import type { ActivitySiteDefinition } from "@runemark/domain";
import { copperMine } from "./copper-mine";
import { eldenRiver } from "./elden-river";
import { greenwood } from "./greenwood";
import { oakridgeWoods } from "./oakridge-woods";
import { oldBarrow } from "./old-barrow";
import { outlawCamp } from "./outlaw-camp";
import { riverbendQuarry } from "./riverbend-quarry";
import { sunfieldFarm } from "./sunfield-farm";
import { sunmeadMeadows } from "./sunmead-meadows";
import { willowGrove } from "./willow-grove";
import { wolfClearing } from "./wolf-clearing";

export const sites = [
  copperMine,
  eldenRiver,
  greenwood,
  oakridgeWoods,
  oldBarrow,
  riverbendQuarry,
  sunfieldFarm,
  sunmeadMeadows,
  willowGrove,
  outlawCamp,
  wolfClearing,
] satisfies ActivitySiteDefinition[];
