import type { ProductionActivityDefinition } from "@runemark/domain";

export const cookBeef = {
  id: "cook-beef",
  kind: "production",
  name: "Cook Beef",
  skillId: "cooking",
  durationMs: 10_000,
  experiencePerAction: 12,
  requiredFacility: ["hearth"],
  requirements: [{ skillId: "cooking", level: 10 }],
  inputs: [{ itemId: "raw-beef", quantity: 1 }],
  outputs: [{ itemId: "cooked-beef", quantity: 1 }],
} satisfies ProductionActivityDefinition;
