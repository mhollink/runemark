import type { ProductionActivityDefinition } from "@runemark/domain";

export const bakeBread = {
  id: "bake-bread",
  kind: "production",
  name: "Bake Bread",
  skillId: "cooking",
  durationMs: 25_000,
  experiencePerAction: 50,
  requiredFacility: ["hearth"],
  requirements: [{ skillId: "cooking", level: 5 }],
  inputs: [{ itemId: "flour", quantity: 1 }],
  outputs: [{ itemId: "bread", quantity: 2 }],
} satisfies ProductionActivityDefinition;
