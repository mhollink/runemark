import type { ProductionActivityDefinition } from "@runemark/domain";

export const cookBearMeat = {
  id: "cook-bear-meat",
  kind: "production",
  name: "Cook Bear Meat",
  skillId: "cooking",
  durationMs: 12_000,
  experiencePerAction: 17,
  requiredFacility: ["hearth"],
  requirements: [{ skillId: "cooking", level: 20 }],
  inputs: [{ itemId: "raw-bear-meat", quantity: 1 }],
  outputs: [{ itemId: "cooked-bear-meat", quantity: 1 }],
} satisfies ProductionActivityDefinition;
