import type { GatheringActivityDefinition } from "@runemark/domain";

export const catchHerring = {
  id: "catch-herring",
  kind: "gathering",
  name: "Catch Herring",
  skillId: "fishing",
  durationMs: 8_000,
  experiencePerAction: 8,
  rewards: {
    kind: "fixed",
    drops: [{ itemId: "raw-herring", quantity: 1 }],
  },
} satisfies GatheringActivityDefinition;
