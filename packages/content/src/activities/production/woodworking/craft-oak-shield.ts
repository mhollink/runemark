import type { ProductionActivityDefinition } from "@runemark/domain";

export const craftOakShield = {
  id: "craft-oak-shield",
  kind: "production",
  name: "Craft Oak Shield",
  skillId: "woodworking",
  durationMs: 45_000,
  experiencePerAction: 30,
  requiredFacility: ["workshop"],
  requirements: [{ skillId: "woodworking", level: 15 }],
  inputs: [{ itemId: "oak-plank", quantity: 3 }],
  outputs: [{ itemId: "oak-shield", quantity: 1 }],
} satisfies ProductionActivityDefinition;
