import type { ProductionActivityDefinition } from "@runemark/domain";

export const craftArrowShafts = {
  id: "craft-arrow-shafts",
  kind: "production",
  name: "Craft Arrow Shafts",
  skillId: "woodworking",
  durationMs: 12_000,
  experiencePerAction: 3,
  requiredFacility: ["workshop"],
  requirements: [{ skillId: "woodworking", level: 1 }],
  inputs: [{ itemId: "birch-log", quantity: 1 }],
  outputs: [{ itemId: "arrow-shaft", quantity: 10 }],
} satisfies ProductionActivityDefinition;
