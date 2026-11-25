import type { ProductionActivityDefinition } from "@runemark/domain";

export const smithBrassHelmet = {
  id: "smith-brass-helmet",
  kind: "production",
  name: "Create Brass Helmet",
  skillId: "smithing",
  durationMs: 30_000,
  experiencePerAction: 45,
  requiredFacility: ["forge"],
  requirements: [{ skillId: "smithing", level: 10 }],
  inputs: [{ itemId: "brass-ingot", quantity: 3 }],
  outputs: [{ itemId: "brass-helmet", quantity: 1 }],
} satisfies ProductionActivityDefinition;
