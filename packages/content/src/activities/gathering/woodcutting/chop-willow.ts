import type { GatheringActivityDefinition } from "@runemark/domain";

export const chopWillow = {
  id: "chop-willow",
  kind: "gathering",
  name: "Chop Willow trees",
  skillId: "woodcutting",
  durationMs: 5000,
  experiencePerAction: 4,
  requirements: [{ skillId: "woodcutting", level: 30 }],
  rewards: {
    kind: "fixed",
    drops: [{ itemId: "willow-log", quantity: 1 }],
  },
} satisfies GatheringActivityDefinition;
