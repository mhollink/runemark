import type { ProductionActivityDefinition } from "@runemark/domain";

export const smithBrassSword = {
  id: "smith-brass-sword",
  kind: "production",
  name: "Create Brass Sword",
  skillId: "smithing",
  durationMs: 30_000,
  experiencePerAction: 30,
  requiredFacility: ["forge"],
  requirements: [{ skillId: "smithing", level: 5 }],
  inputs: [{ itemId: "brass-ingot", quantity: 2 }],
  outputs: [{ itemId: "brass-sword", quantity: 1 }],
} satisfies ProductionActivityDefinition;
