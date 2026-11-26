import type { MonsterDefinition } from "@runemark/domain";
import { fixedDrop } from "../common/loot/loot-builders";

export const blackBear = {
  id: "black-bear",
  name: "Black Bear",
  combat: {
    maxHitpoints: 30,
    attackType: "melee",
    attackIntervalMs: 4_500,
    maxHit: 4,
    accuracy: 0.65,
    defense: {
      magic: 30,
      melee: 40,
      ranged: 40,
    },
  },
  loot: {
    kind: "all",
    rewards: [
      {
        kind: "fixed",
        drops: [
          { itemId: "bones", quantity: 1 },
          { itemId: "raw-bear-meat", quantity: 2 },
          { itemId: "bear-pelt", quantity: 1 },
        ],
      },
      {
        kind: "conditional",
        oneIn: 10,
        success: fixedDrop("bear-claw"),
        failure: { kind: "nothing" },
      },
    ],
  },
} satisfies MonsterDefinition;
