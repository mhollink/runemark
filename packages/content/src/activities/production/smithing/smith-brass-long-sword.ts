import type { ProductionActivityDefinition } from "@runemark/domain";

export const smithBrassLongSword = {
  id: "smith-brass-long-sword",
  kind: "production",
  name: "Create Brass Long Sword",
  skillId: "smithing",
  durationMs: 30_000,
  experiencePerAction: 45,
  requiredFacility: ["forge"],
  requirements: [{ skillId: "smithing", level: 13 }],
  inputs: [{ itemId: "brass-ingot", quantity: 3 }],
  outputs: [{ itemId: "brass-long-sword", quantity: 1 }],
} satisfies ProductionActivityDefinition;
