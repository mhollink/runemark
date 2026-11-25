import type { MonsterDefinition } from "@runemark/domain";

export const zombie = {
  id: "zombie",
  name: "Zombie",
  combat: {
    maxHitpoints: 20,
    attackType: "melee",
    attackIntervalMs: 5_000,
    maxHit: 4,
    accuracy: 0.4,
  },
  loot: {
    kind: "fixed",
    drops: [{ itemId: "bones", quantity: 1 }],
  },
} satisfies MonsterDefinition;
