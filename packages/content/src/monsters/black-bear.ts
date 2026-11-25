import type { MonsterDefinition } from "@runemark/domain";

export const blackBear = {
  id: "black-bear",
  name: "Black Bear",
  combat: {
    maxHitpoints: 30,
    attackType: "melee",
    attackIntervalMs: 4_500,
    maxHit: 4,
    accuracy: 0.65,
  },
  loot: {
    kind: "fixed",
    drops: [{ itemId: "bones", quantity: 1 }],
  },
} satisfies MonsterDefinition;
