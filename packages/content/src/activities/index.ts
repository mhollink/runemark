import type { ActivityDefinition } from "@runemark/domain";

/// Combat
import { fightBlackBear } from "./combat/fight-black-bear";
import { fightChicken } from "./combat/fight-chicken";
import { fightCow } from "./combat/fight-cow";
import { fightDraugar } from "./combat/fight-draugar";
import { fightGreyWolf } from "./combat/fight-grey-wolf";
import { fightOutlaw } from "./combat/fight-outlaw";
import { fightOutlawLeader } from "./combat/fight-outlaw-leader";
import { fightSkeleton } from "./combat/fight-skeleton";
import { fightWildBoar } from "./combat/fight-wild-boar";
import { fightZombie } from "./combat/fight-zombie";
/// Fishing
import { catchBream } from "./gathering/fishing/catch-bream";
import { catchHerring } from "./gathering/fishing/catch-herring";
import { catchPike } from "./gathering/fishing/catch-pike";
/// Foraging
import { gatherBilberries } from "./gathering/foraging/gather-bilberries";
import { gatherElderberries } from "./gathering/foraging/gather-elderberries";
import { gatherWheat } from "./gathering/foraging/gather-wheat";
/// Mining
import { mineCopper } from "./gathering/mining/mine-copper";
import { mineIron } from "./gathering/mining/mine-iron";
import { mineZinc } from "./gathering/mining/mine-zinc";
/// Woodcutting
import { chopBirch } from "./gathering/woodcutting/chop-birch";
import { chopOak } from "./gathering/woodcutting/chop-oak";
import { chopWillow } from "./gathering/woodcutting/chop-willow";
/// Cooking
import { bakeBread } from "./production/cooking/bake-bread";
import { cookBearMeat } from "./production/cooking/cook-bear-meat";
import { cookBeef } from "./production/cooking/cook-beef";
import { cookBream } from "./production/cooking/cook-bream";
import { cookChicken } from "./production/cooking/cook-chicken";
import { cookElderberries } from "./production/cooking/cook-elderberries";
import { cookHerring } from "./production/cooking/cook-herring";
import { cookPike } from "./production/cooking/cook-pike";
import { cookPork } from "./production/cooking/cook-pork";
import { millFlour } from "./production/cooking/mill-flour";
import { makeBrassIngots } from "./production/smithing/make-brass-ingots";
/// Smithing
import { smithBrassAxe } from "./production/smithing/smith-brass-axe";
import { smithBrassHelmet } from "./production/smithing/smith-brass-helmet";
import { smithBrassLongSword } from "./production/smithing/smith-brass-long-sword";
import { smithBrassMailShirt } from "./production/smithing/smith-brass-mail-shirt";
import { smithBrassSword } from "./production/smithing/smith-brass-sword";

export const activities = [
  fightBlackBear,
  fightChicken,
  fightCow,
  fightDraugar,
  fightGreyWolf,
  fightOutlaw,
  fightOutlawLeader,
  fightSkeleton,
  fightWildBoar,
  fightZombie,
  catchBream,
  catchHerring,
  catchPike,
  gatherBilberries,
  gatherElderberries,
  gatherWheat,
  mineCopper,
  mineZinc,
  mineIron,
  chopBirch,
  chopOak,
  chopWillow,
  bakeBread,
  cookBearMeat,
  cookBeef,
  cookBream,
  cookChicken,
  cookElderberries,
  cookHerring,
  cookPike,
  cookPork,
  millFlour,
  makeBrassIngots,
  smithBrassAxe,
  smithBrassHelmet,
  smithBrassLongSword,
  smithBrassMailShirt,
  smithBrassSword,
] satisfies ActivityDefinition[];
