import type { MonsterDefinition } from "@runemark/domain";
import { fixedDrop } from "../common/loot/loot-builders";

export const wildBoar = {
  id: "wild-boar",
  name: "Wild Boar",
  combat: {
    maxHitpoints: 14,
    attackType: "melee",
    attackIntervalMs: 3_500,
    maxHit: 2,
    accuracy: 0.5,
    defense: {
      magic: 5,
      melee: 15,
      ranged: 15,
    },
  },
  loot: {
    kind: "all",
    rewards: [
      {
        kind: "fixed",
        drops: [
          { itemId: "bones", quantity: 1 },
          { itemId: "raw-pork", quantity: 1 },
          { itemId: "boar-hide", quantity: 1 },
        ],
      },
      {
        kind: "conditional",
        oneIn: 20,
        success: fixedDrop("boar-tusk"),
        failure: { kind: "nothing" },
      },
    ],
  },
} satisfies MonsterDefinition;
