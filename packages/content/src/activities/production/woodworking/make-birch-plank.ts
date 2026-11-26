import type { ProductionActivityDefinition } from "@runemark/domain";

export const craftBirchPlank = {
  id: "craft-birch-plank",
  kind: "production",
  name: "Make Birch Plank",
  skillId: "woodworking",
  durationMs: 60_000,
  experiencePerAction: 25,
  requiredFacility: ["sawmill"],
  requirements: [{ skillId: "woodworking", level: 1 }],
  inputs: [{ itemId: "birch-log", quantity: 1 }],
  outputs: [{ itemId: "birch-plank", quantity: 1 }],
} satisfies ProductionActivityDefinition;
