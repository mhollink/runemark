import type { MonsterDefinition } from "@runemark/domain";
import { currencyRange, fixedDrop } from "../common/loot/loot-builders";

export const outlawLeader = {
  id: "outlaw-leader",
  name: "Outlaw Leader",
  combat: {
    maxHitpoints: 40,
    attackType: "melee",
    attackIntervalMs: 3_000,
    maxHit: 6,
    accuracy: 0.7,
    defense: {
      magic: 30,
      melee: 55,
      ranged: 40,
    },
  },
  loot: {
    kind: "all",
    rewards: [
      { kind: "fixed", drops: [{ itemId: "bones", quantity: 1 }] },
      currencyRange(25, 50),
      {
        kind: "conditional",
        oneIn: 250,
        success: fixedDrop("outlaw-signet-ring"),
        failure: {
          kind: "weighted",
          entries: [
            { weight: 2, reward: fixedDrop("iron-sword") },
            { weight: 2, reward: fixedDrop("reinforced-oak-shield") },
            { weight: 1, reward: fixedDrop("iron-helmet") },
            { weight: 1, reward: fixedDrop("iron-mail-shirt") },
            { weight: 26, reward: { kind: "nothing" } },
          ],
        },
      },
    ],
  },
} satisfies MonsterDefinition;
