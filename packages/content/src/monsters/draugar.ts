import type { MonsterDefinition } from "@runemark/domain";

export const draugar = {
  id: "draugar",
  name: "Draugar",
  combat: {
    maxHitpoints: 35,
    attackType: "melee",
    attackIntervalMs: 5_000,
    maxHit: 5,
    accuracy: 0.7,
  },
  loot: {
    kind: "fixed",
    drops: [{ itemId: "bones", quantity: 1 }],
  },
} satisfies MonsterDefinition;
