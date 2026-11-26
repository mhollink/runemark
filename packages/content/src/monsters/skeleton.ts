import type { MonsterDefinition } from "@runemark/domain";
import { fixedDrop, quantityRange } from "../common/loot/loot-builders";

export const skeleton = {
  id: "skeleton",
  name: "Skeleton",
  combat: {
    maxHitpoints: 12,
    attackType: "melee",
    attackIntervalMs: 4_000,
    maxHit: 2,
    accuracy: 0.45,
    defense: {
      magic: 5,
      melee: 15,
      ranged: 40,
    },
  },
  loot: {
    kind: "all",
    rewards: [
      { kind: "fixed", drops: [{ itemId: "bones", quantity: 1 }] },
      {
        kind: "conditional",
        oneIn: 2,
        success: quantityRange("arrow", 3, 6),
        failure: { kind: "nothing" },
      },
      {
        kind: "weighted",
        entries: [
          { weight: 2, reward: fixedDrop("brass-sword") },
          { weight: 2, reward: fixedDrop("brass-axe") },
          { weight: 1, reward: fixedDrop("brass-mail-shirt") },
          { weight: 123, reward: { kind: "nothing" } },
        ],
      },
    ],
  },
} satisfies MonsterDefinition;
