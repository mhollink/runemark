import type { ActivityDefinition } from "@runemark/domain";
import { catchHerring } from "./catch-herring";
import { chopBirch } from "./chop-birch";
import { cookChicken } from "./cook-chicken";
import { cookHerring } from "./cook-herring";
import { fightChicken } from "./fight-chicken";
import { mineCopper } from "./mine-copper";

export const activities = [
  chopBirch,
  mineCopper,
  catchHerring,
  cookHerring,
  cookChicken,
  fightChicken,
] satisfies ActivityDefinition[];
