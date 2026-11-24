import type { ProductionActivityDefinition } from "@runemark/domain";

export const cookHerring = {
  id: "cook-herring",
  kind: "production",
  name: "Cook Herring",
  skillId: "cooking",
  durationMs: 6_000,
  experiencePerAction: 8,
  inputs: [{ itemId: "raw-herring", quantity: 1 }],
  outputs: [{ itemId: "cooked-herring", quantity: 1 }],
} satisfies ProductionActivityDefinition;
