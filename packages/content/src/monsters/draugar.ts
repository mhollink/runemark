import type { MonsterDefinition } from "@runemark/domain";
import { fixedDrop, quantityRange } from "../common/loot/loot-builders";

export const draugar = {
  id: "draugar",
  name: "Draugar",
  combat: {
    maxHitpoints: 35,
    attackType: "melee",
    attackIntervalMs: 5_000,
    maxHit: 5,
    accuracy: 0.7,
    defense: {
      magic: 0,
      melee: 35,
      ranged: 45,
    },
  },
  loot: {
    kind: "all",
    rewards: [
      { kind: "fixed", drops: [{ itemId: "bones", quantity: 1 }] },
      quantityRange("coins", 12, 25),
      {
        kind: "conditional",
        oneIn: 4,
        success: quantityRange("rune-fragment", 1, 3),
        failure: { kind: "nothing" },
      },
      {
        kind: "conditional",
        oneIn: 200,
        success: fixedDrop("ancient-amulet"),
        failure: {
          kind: "weighted",
          entries: [
            { weight: 4, reward: fixedDrop("brass-axe") },
            { weight: 4, reward: fixedDrop("brass-mail-shirt") },
            { weight: 2, reward: fixedDrop("reinforced-oak-shield") },
            { weight: 1, reward: fixedDrop("iron-sword") },
            { weight: 1, reward: fixedDrop("iron-helmet") },
            { weight: 116, reward: { kind: "nothing" } },
          ],
        },
      },
    ],
  },
} satisfies MonsterDefinition;
