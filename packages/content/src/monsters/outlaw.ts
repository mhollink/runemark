import type { MonsterDefinition } from "@runemark/domain";

export const outlaw = {
  id: "outlaw",
  name: "Outlaw",
  combat: {
    maxHitpoints: 22,
    attackType: "melee",
    attackIntervalMs: 3_500,
    maxHit: 3,
    accuracy: 0.6,
  },
  loot: {
    kind: "fixed",
    drops: [{ itemId: "bones", quantity: 1 }],
  },
} satisfies MonsterDefinition;
