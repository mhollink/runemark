import type { GatheringActivityDefinition } from "@runemark/domain";

export const gatherWheat = {
  id: "gather-wheat",
  kind: "gathering",
  name: "Gather Wheat",
  skillId: "foraging",
  durationMs: 6_000,
  experiencePerAction: 5,
  requirements: [{ skillId: "foraging", level: 1 }],
  rewards: {
    kind: "all",
    rewards: [
      {
        kind: "fixed",
        drops: [{ itemId: "wheat", quantity: 1 }],
      },
    ],
  },
} satisfies GatheringActivityDefinition;
