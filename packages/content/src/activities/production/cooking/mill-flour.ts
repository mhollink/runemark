import type { ProductionActivityDefinition } from "@runemark/domain";

export const millFlour = {
  id: "mill-flour",
  kind: "production",
  name: "Mill flour",
  skillId: "cooking",
  durationMs: 10_000,
  experiencePerAction: 4,
  requiredFacility: ["mill"],
  requirements: [{ skillId: "cooking", level: 1 }],
  inputs: [{ itemId: "wheat", quantity: 4 }],
  outputs: [{ itemId: "flour", quantity: 1 }],
} satisfies ProductionActivityDefinition;
