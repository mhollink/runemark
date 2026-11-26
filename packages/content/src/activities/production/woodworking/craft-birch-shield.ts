import type { ProductionActivityDefinition } from "@runemark/domain";

export const craftBirchShield = {
  id: "craft-birch-shield",
  kind: "production",
  name: "Craft Birch Shield",
  skillId: "woodworking",
  durationMs: 45_000,
  experiencePerAction: 20,
  requiredFacility: ["workshop"],
  requirements: [{ skillId: "woodworking", level: 5 }],
  inputs: [{ itemId: "birch-plank", quantity: 3 }],
  outputs: [{ itemId: "birch-shield", quantity: 1 }],
} satisfies ProductionActivityDefinition;
