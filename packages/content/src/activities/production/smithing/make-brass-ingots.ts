import type { ProductionActivityDefinition } from "@runemark/domain";

export const makeBrassIngots = {
  id: "melt-brass-ingots",
  kind: "production",
  name: "Make Brass Ingots",
  skillId: "smithing",
  durationMs: 20_000,
  experiencePerAction: 10,
  requiredFacility: ["forge"],
  requirements: [{ skillId: "smithing", level: 1 }],
  inputs: [
    { itemId: "copper-ore", quantity: 2 },
    { itemId: "zinc-ore", quantity: 1 },
  ],
  outputs: [{ itemId: "brass-ingot", quantity: 1 }],
} satisfies ProductionActivityDefinition;
