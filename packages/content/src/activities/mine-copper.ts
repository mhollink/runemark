import type { GatheringActivityDefinition } from "@runemark/domain";

export const mineCopper = {
  id: "mine-copper",
  kind: "gathering",
  name: "Mine Copper Ore",
  skillId: "mining",
  durationMs: 7000,
  experiencePerAction: 7,

  rewards: {
    kind: "all",
    rewards: [
      {
        kind: "table",
        tableId: "mining-gems",
      },
      {
        kind: "fixed",
        drops: [{ itemId: "copper-ore", quantity: 1 }],
      },
    ],
  },
} satisfies GatheringActivityDefinition;
