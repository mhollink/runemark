import type { MonsterDefinition } from "@runemark/domain";

export const chicken = {
  id: "chicken",
  name: "Chicken",

  loot: {
    kind: "all",
    rewards: [
      {
        kind: "fixed",
        drops: [
          { itemId: "bones", quantity: 1 },
          { itemId: "raw-chicken", quantity: 1 },
        ],
      },
      {
        kind: "weighted",
        entries: [
          {
            weight: 70,
            reward: {
              kind: "fixed",
              drops: [
                {
                  itemId: "feather",
                  quantity: 5,
                },
              ],
            },
          },
          {
            weight: 30,
            reward: {
              kind: "fixed",
              drops: [
                {
                  itemId: "feather",
                  quantity: 9,
                },
              ],
            },
          },
        ],
      },
    ],
  },
} satisfies MonsterDefinition;
