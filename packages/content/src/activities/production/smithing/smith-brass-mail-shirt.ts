import type { ProductionActivityDefinition } from "@runemark/domain";

export const smithBrassMailShirt = {
  id: "smith-brass-mail-shirt",
  kind: "production",
  name: "Create Brass Mail Shirt",
  skillId: "smithing",
  durationMs: 30_000,
  experiencePerAction: 60,
  requiredFacility: ["forge"],
  requirements: [{ skillId: "smithing", level: 15 }],
  inputs: [{ itemId: "brass-ingot", quantity: 4 }],
  outputs: [{ itemId: "brass-mail-shirt", quantity: 1 }],
} satisfies ProductionActivityDefinition;
