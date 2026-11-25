import type { GatheringActivityDefinition } from "@runemark/domain";

export const mineIron = {
  id: "mine-iron",
  kind: "gathering",
  name: "Mine Iron Ore",
  skillId: "mining",
  durationMs: 10_000,
  experiencePerAction: 10,
  requirements: [{ skillId: "mining", level: 15 }],
  rewards: {
    kind: "all",
    rewards: [
      {
        kind: "table",
        tableId: "mining-gems",
      },
      {
        kind: "fixed",
        drops: [{ itemId: "iron-ore", quantity: 1 }],
      },
    ],
  },
} satisfies GatheringActivityDefinition;
