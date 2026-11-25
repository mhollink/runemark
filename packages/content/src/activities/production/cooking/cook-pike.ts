import type { ProductionActivityDefinition } from "@runemark/domain";

export const cookPike = {
  id: "cook-pike",
  kind: "production",
  name: "Cook Pike",
  skillId: "cooking",
  durationMs: 12_000,
  experiencePerAction: 18,
  requiredFacility: ["hearth"],
  requirements: [{ skillId: "cooking", level: 25 }],
  inputs: [{ itemId: "raw-pike", quantity: 1 }],
  outputs: [{ itemId: "cooked-pike", quantity: 1 }],
} satisfies ProductionActivityDefinition;
