import type { ItemDefinition } from "@runemark/domain";
import { birchLog } from "./birch-log";
import { bones } from "./bones";
import { cookedChicken } from "./cooked-chicken";
import { cookedHerring } from "./cooked-herring";
import { copperOre } from "./copper-ore";
import { feather } from "./feather";
import { rawChicken } from "./raw-chicken";
import { rawHerring } from "./raw-herring";
import { uncutRuby } from "./uncut-ruby";
import { uncutSapphire } from "./uncut-sapphire";

export const items = [
  birchLog,
  copperOre,
  uncutSapphire,
  uncutRuby,
  feather,
  rawChicken,
  bones,
  rawHerring,
  cookedHerring,
  cookedChicken,
] satisfies ItemDefinition[];
