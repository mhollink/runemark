import type { LootTableDefinition } from "@runemark/domain";

export const miningGems = {
  id: "mining-gems",
  kind: "conditional",
  oneIn: 50,
  success: {
    kind: "weighted",
    entries: [
      {
        weight: 80,
        reward: {
          kind: "fixed",
          drops: [{ itemId: "uncut-sapphire", quantity: 1 }],
        },
      },
      {
        weight: 20,
        reward: {
          kind: "fixed",
          drops: [{ itemId: "uncut-ruby", quantity: 1 }],
        },
      },
    ],
  },
  failure: {
    kind: "nothing",
  },
} satisfies LootTableDefinition;
