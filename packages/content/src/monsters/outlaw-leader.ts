import type { MonsterDefinition } from "@runemark/domain";

export const outlawLeader = {
  id: "outlaw-leader",
  name: "Outlaw Leader",
  combat: {
    maxHitpoints: 40,
    attackType: "melee",
    attackIntervalMs: 3_000,
    maxHit: 6,
    accuracy: 0.7,
  },
  loot: {
    kind: "fixed",
    drops: [{ itemId: "bones", quantity: 1 }],
  },
} satisfies MonsterDefinition;
