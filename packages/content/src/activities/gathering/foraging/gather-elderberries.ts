import type { GatheringActivityDefinition } from "@runemark/domain";

export const gatherElderberries = {
  id: "gather-elderberries",
  kind: "gathering",
  name: "Gather Elderberries",
  skillId: "foraging",
  durationMs: 20_000,
  experiencePerAction: 20,
  requirements: [{ skillId: "foraging", level: 1 }],
  rewards: {
    kind: "all",
    rewards: [
      {
        kind: "fixed",
        drops: [{ itemId: "elderberries", quantity: 2 }],
      },
    ],
  },
} satisfies GatheringActivityDefinition;
