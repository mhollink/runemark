import type { ProductionActivityDefinition } from "@runemark/domain";

export const cookBream = {
  id: "cook-bream",
  kind: "production",
  name: "Cook Bream",
  skillId: "cooking",
  durationMs: 8_000,
  experiencePerAction: 10,
  requiredFacility: ["hearth"],
  requirements: [{ skillId: "cooking", level: 5 }],
  inputs: [{ itemId: "raw-bream", quantity: 1 }],
  outputs: [{ itemId: "cooked-bream", quantity: 1 }],
} satisfies ProductionActivityDefinition;
