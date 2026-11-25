import type { GatheringActivityDefinition } from "@runemark/domain";

export const chopOak = {
  id: "chop-oak",
  kind: "gathering",
  name: "Chop Oak trees",
  skillId: "woodcutting",
  durationMs: 5000,
  experiencePerAction: 4,
  requirements: [{ skillId: "woodcutting", level: 15 }],
  rewards: {
    kind: "fixed",
    drops: [{ itemId: "oak-log", quantity: 1 }],
  },
} satisfies GatheringActivityDefinition;
