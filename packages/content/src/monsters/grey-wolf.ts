import type { MonsterDefinition } from "@runemark/domain";

export const greyWolf = {
  id: "grey-wolf",
  name: "Grey Wolf",
  combat: {
    maxHitpoints: 16,
    attackType: "melee",
    attackIntervalMs: 3_000,
    maxHit: 3,
    accuracy: 0.55,
  },
  loot: {
    kind: "fixed",
    drops: [{ itemId: "bones", quantity: 1 }],
  },
} satisfies MonsterDefinition;
