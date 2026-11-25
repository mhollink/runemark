import type { ProductionActivityDefinition } from "@runemark/domain";

export const cookChicken = {
  id: "cook-chicken",
  kind: "production",
  name: "Cook Chicken",
  skillId: "cooking",
  durationMs: 8_000,
  experiencePerAction: 9,
  requiredFacility: ["hearth"],
  requirements: [{ skillId: "cooking", level: 5 }],
  inputs: [{ itemId: "raw-chicken", quantity: 1 }],
  outputs: [{ itemId: "cooked-chicken", quantity: 1 }],
} satisfies ProductionActivityDefinition;
