import type { MonsterDefinition } from "@runemark/domain";
import {
  currencyRange,
  fixedDrop,
  quantityRange,
} from "../common/loot/loot-builders";

export const outlaw = {
  id: "outlaw",
  name: "Outlaw",
  combat: {
    maxHitpoints: 22,
    attackType: "melee",
    attackIntervalMs: 3_500,
    maxHit: 3,
    accuracy: 0.6,
    defense: {
      magic: 15,
      melee: 20,
      ranged: 15,
    },
  },
  loot: {
    kind: "all",
    rewards: [
      { kind: "fixed", drops: [{ itemId: "bones", quantity: 1 }] },
      currencyRange(8, 15),
      {
        kind: "conditional",
        oneIn: 2,
        success: quantityRange("arrow", 5, 10),
        failure: { kind: "nothing" },
      },
      {
        kind: "weighted",
        entries: [
          { weight: 40, reward: quantityRange("cloth-scraps", 2, 4) },
          { weight: 60, reward: { kind: "nothing" } },
        ],
      },
      {
        kind: "weighted",
        entries: [
          { weight: 4, reward: fixedDrop("brass-sword") },
          { weight: 4, reward: fixedDrop("brass-axe") },
          { weight: 2, reward: fixedDrop("brass-helmet") },
          { weight: 2, reward: fixedDrop("brass-mail-shirt") },
          { weight: 2, reward: fixedDrop("oak-shield") },
          { weight: 1, reward: fixedDrop("brass-long-sword") },
          { weight: 113, reward: { kind: "nothing" } },
        ],
      },
      {
        kind: "weighted",
        entries: [
          { weight: 2, reward: fixedDrop("uncut-sapphire") },
          { weight: 1, reward: fixedDrop("uncut-ruby") },
          { weight: 253, reward: { kind: "nothing" } },
        ],
      },
    ],
  },
} satisfies MonsterDefinition;
