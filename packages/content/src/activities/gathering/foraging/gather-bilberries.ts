import type { GatheringActivityDefinition } from "@runemark/domain";

export const gatherBilberries = {
  id: "gather-bilberries",
  kind: "gathering",
  name: "Gather Bilberries",
  skillId: "foraging",
  durationMs: 20_000,
  experiencePerAction: 24,
  requirements: [{ skillId: "foraging", level: 15 }],
  rewards: {
    kind: "all",
    rewards: [
      {
        kind: "fixed",
        drops: [{ itemId: "bilberries", quantity: 2 }],
      },
    ],
  },
} satisfies GatheringActivityDefinition;
