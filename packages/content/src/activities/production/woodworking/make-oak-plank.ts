import type { ProductionActivityDefinition } from "@runemark/domain";

export const craftOakPlank = {
  id: "craft-oak-plank",
  kind: "production",
  name: "Make Oak Plank",
  skillId: "woodworking",
  durationMs: 60_000,
  experiencePerAction: 40,
  requiredFacility: ["sawmill"],
  requirements: [{ skillId: "woodworking", level: 5 }],
  inputs: [{ itemId: "oak-log", quantity: 1 }],
  outputs: [{ itemId: "oak-plank", quantity: 1 }],
} satisfies ProductionActivityDefinition;
