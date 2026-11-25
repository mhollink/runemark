import type { MonsterDefinition } from "@runemark/domain";

export const skeleton = {
  id: "skeleton",
  name: "Skeleton",
  combat: {
    maxHitpoints: 12,
    attackType: "melee",
    attackIntervalMs: 4_000,
    maxHit: 2,
    accuracy: 0.45,
  },
  loot: {
    kind: "fixed",
    drops: [{ itemId: "bones", quantity: 1 }],
  },
} satisfies MonsterDefinition;
