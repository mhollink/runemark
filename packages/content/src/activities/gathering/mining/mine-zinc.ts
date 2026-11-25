import type { GatheringActivityDefinition } from "@runemark/domain";

export const mineZinc = {
  id: "mine-zinc",
  kind: "gathering",
  name: "Mine Zinc Ore",
  skillId: "mining",
  durationMs: 7500,
  experiencePerAction: 6,
  requirements: [{ skillId: "mining", level: 5 }],
  rewards: {
    kind: "all",
    rewards: [
      {
        kind: "table",
        tableId: "mining-gems",
      },
      {
        kind: "fixed",
        drops: [{ itemId: "zinc-ore", quantity: 1 }],
      },
    ],
  },
} satisfies GatheringActivityDefinition;
