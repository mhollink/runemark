import type { SkillDefinition } from "@runemark/domain";
import { attack } from "./attack";
import { constitution } from "./constitution";
import { cooking } from "./cooking";
import { defense } from "./defense";
import { fishing } from "./fishing";
import { mining } from "./mining";
import { strength } from "./strength";
import { woodcutting } from "./woodcutting";

export const skills = [
  attack,
  strength,
  defense,
  constitution,
  woodcutting,
  mining,
  fishing,
  cooking,
] satisfies SkillDefinition[];
