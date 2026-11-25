import type { ProductionActivityDefinition } from "@runemark/domain";

export const smithBrassAxe = {
  id: "smith-brass-axe",
  kind: "production",
  name: "Create Brass Axe",
  skillId: "smithing",
  durationMs: 30_000,
  experiencePerAction: 30,
  requiredFacility: ["forge"],
  requirements: [{ skillId: "smithing", level: 3 }],
  inputs: [{ itemId: "brass-ingot", quantity: 2 }],
  outputs: [{ itemId: "brass-axe", quantity: 1 }],
} satisfies ProductionActivityDefinition;
