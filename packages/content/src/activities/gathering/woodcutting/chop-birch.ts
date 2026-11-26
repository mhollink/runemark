import type { GatheringActivityDefinition } from "@runemark/domain";

export const chopBirch = {
  id: "chop-birch",
  kind: "gathering",
  name: "Chop Birch tree",
  skillId: "woodcutting",
  durationMs: 4000,
  experiencePerAction: 4,

  rewards: {
    kind: "fixed",
    drops: [{ itemId: "birch-log", quantity: 1 }],
  },
} satisfies GatheringActivityDefinition;
