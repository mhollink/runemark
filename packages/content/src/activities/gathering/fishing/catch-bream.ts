import type { GatheringActivityDefinition } from "@runemark/domain";

export const catchBream = {
  id: "catch-bream",
  kind: "gathering",
  name: "Catch Bream",
  skillId: "fishing",
  durationMs: 10_000,
  experiencePerAction: 12,
  requirements: [{ skillId: "fishing", level: 5 }],
  rewards: {
    kind: "fixed",
    drops: [{ itemId: "raw-bream", quantity: 1 }],
  },
} satisfies GatheringActivityDefinition;
