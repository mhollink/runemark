import type { MonsterDefinition } from "@runemark/domain";

export const wildBoar = {
  id: "wild-boar",
  name: "Wild Boar",
  combat: {
    maxHitpoints: 14,
    attackType: "melee",
    attackIntervalMs: 3_500,
    maxHit: 2,
    accuracy: 0.5,
  },
  loot: {
    kind: "fixed",
    drops: [{ itemId: "bones", quantity: 1 }],
  },
} satisfies MonsterDefinition;
