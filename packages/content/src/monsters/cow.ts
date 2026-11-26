import type { MonsterDefinition } from "@runemark/domain";

export const cow = {
  id: "cow",
  name: "Cow",
  combat: {
    maxHitpoints: 8,
    attackType: "melee",
    attackIntervalMs: 4_500,
    maxHit: 2,
    accuracy: 0.35,
    defense: {
      magic: 5,
      melee: 5,
      ranged: 5,
    },
  },
  loot: {
    kind: "fixed",
    drops: [
      { itemId: "bones", quantity: 1 },
      { itemId: "raw-beef", quantity: 1 },
      { itemId: "cowhide", quantity: 1 },
    ],
  },
} satisfies MonsterDefinition;
