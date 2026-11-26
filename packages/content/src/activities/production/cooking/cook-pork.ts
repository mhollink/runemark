import type { ProductionActivityDefinition } from "@runemark/domain";

export const cookPork = {
  id: "cook-pork",
  kind: "production",
  name: "Cook Pork",
  skillId: "cooking",
  durationMs: 10_000,
  experiencePerAction: 15,
  requiredFacility: ["hearth"],
  requirements: [{ skillId: "cooking", level: 15 }],
  inputs: [{ itemId: "raw-pork", quantity: 1 }],
  outputs: [{ itemId: "cooked-pork", quantity: 1 }],
} satisfies ProductionActivityDefinition;
