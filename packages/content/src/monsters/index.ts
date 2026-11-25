import type { MonsterDefinition } from "@runemark/domain";
import { blackBear } from "./black-bear";
import { chicken } from "./chicken";
import { cow } from "./cow";
import { draugar } from "./draugar";
import { greyWolf } from "./grey-wolf";
import { outlaw } from "./outlaw";
import { outlawLeader } from "./outlaw-leader";
import { skeleton } from "./skeleton";
import { wildBoar } from "./wild-boar";
import { zombie } from "./zombie";

export const monsters = [
  blackBear,
  chicken,
  cow,
  draugar,
  greyWolf,
  outlaw,
  outlawLeader,
  skeleton,
  wildBoar,
  zombie,
] satisfies MonsterDefinition[];
