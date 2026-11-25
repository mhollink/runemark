import type { SkillDefinition } from "@runemark/domain";

import { attack } from "./combat/attack";
import { constitution } from "./combat/constitution";
import { defense } from "./combat/defense";
import { strength } from "./combat/strength";

import { fishing } from "./gathering/fishing";
import { foraging } from "./gathering/foraging";
import { mining } from "./gathering/mining";
import { woodcutting } from "./gathering/woodcutting";

import { cooking } from "./production/cooking";
import { smithing } from "./production/smithing";
import { woodworking } from "./production/woodworking";

export const skills = [
  attack,
  strength,
  defense,
  foraging,
  constitution,
  woodcutting,
  mining,
  fishing,
  cooking,
  smithing,
  woodworking,
] satisfies SkillDefinition[];
