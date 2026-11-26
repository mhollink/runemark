import type { MonsterDefinition } from "@runemark/domain";
import { fixedDrop, quantityRange } from "../common/loot/loot-builders";

export const zombie = {
  id: "zombie",
  name: "Zombie",
  combat: {
    maxHitpoints: 20,
    attackType: "melee",
    attackIntervalMs: 5_000,
    maxHit: 4,
    accuracy: 0.4,
    defense: {
      magic: 10,
      melee: 25,
      ranged: 25,
    },
  },
  loot: {
    kind: "all",
    rewards: [
      { kind: "fixed", drops: [{ itemId: "bones", quantity: 1 }] },
      quantityRange("coins", 3, 8),
      {
        kind: "weighted",
        entries: [
          { weight: 40, reward: quantityRange("cloth-scraps", 1, 3) },
          { weight: 60, reward: { kind: "nothing" } },
        ],
      },
      {
        kind: "weighted",
        entries: [
          { weight: 2, reward: fixedDrop("brass-sword") },
          { weight: 2, reward: fixedDrop("brass-helmet") },
          { weight: 2, reward: fixedDrop("leather-boots") },
          { weight: 1, reward: fixedDrop("brass-mail-shirt") },
          { weight: 121, reward: { kind: "nothing" } },
        ],
      },
      {
        kind: "conditional",
        oneIn: 128,
        success: fixedDrop("uncut-sapphire"),
        failure: { kind: "nothing" },
      },
    ],
  },
} satisfies MonsterDefinition;
