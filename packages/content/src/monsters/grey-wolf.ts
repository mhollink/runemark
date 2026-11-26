import type { MonsterDefinition } from "@runemark/domain";
import { fixedDrop } from "../common/loot/loot-builders";

export const greyWolf = {
  id: "grey-wolf",
  name: "Grey Wolf",
  combat: {
    maxHitpoints: 16,
    attackType: "melee",
    attackIntervalMs: 3_000,
    maxHit: 3,
    accuracy: 0.55,
    defense: {
      magic: 10,
      melee: 20,
      ranged: 20,
    },
  },
  loot: {
    kind: "all",
    rewards: [
      {
        kind: "fixed",
        drops: [
          { itemId: "bones", quantity: 1 },
          { itemId: "wolf-pelt", quantity: 1 },
        ],
      },
      {
        kind: "weighted",
        entries: [
          { weight: 15, reward: fixedDrop("wolf-fang") },
          { weight: 85, reward: { kind: "nothing" } },
        ],
      },
    ],
  },
} satisfies MonsterDefinition;
