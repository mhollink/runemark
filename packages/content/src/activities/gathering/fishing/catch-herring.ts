import type { GatheringActivityDefinition } from "@runemark/domain";

export const catchHerring = {
  id: "catch-herring",
  kind: "gathering",
  name: "Catch Herring",
  skillId: "fishing",
  durationMs: 7_000,
  experiencePerAction: 5,
  requirements: [{ skillId: "fishing", level: 1 }],
  rewards: {
    kind: "fixed",
    drops: [{ itemId: "raw-herring", quantity: 1 }],
  },
} satisfies GatheringActivityDefinition;
