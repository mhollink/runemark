import type { GatheringActivityDefinition } from "@runemark/domain";

export const catchPike = {
  id: "catch-pike",
  kind: "gathering",
  name: "Catch Pike",
  skillId: "fishing",
  durationMs: 15_000,
  experiencePerAction: 18,
  requirements: [{ skillId: "fishing", level: 20 }],
  rewards: {
    kind: "fixed",
    drops: [{ itemId: "raw-pike", quantity: 1 }],
  },
} satisfies GatheringActivityDefinition;
