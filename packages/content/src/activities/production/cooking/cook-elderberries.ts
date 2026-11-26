import type { ProductionActivityDefinition } from "@runemark/domain";

export const cookElderberries = {
  id: "cook-elderberries",
  kind: "production",
  name: "Cook Elderberries",
  skillId: "cooking",
  durationMs: 20_000,
  experiencePerAction: 25,
  requiredFacility: ["hearth"],
  requirements: [{ skillId: "cooking", level: 1 }],
  inputs: [{ itemId: "elderberries", quantity: 4 }],
  outputs: [{ itemId: "cooked-elderberries", quantity: 4 }],
} satisfies ProductionActivityDefinition;
