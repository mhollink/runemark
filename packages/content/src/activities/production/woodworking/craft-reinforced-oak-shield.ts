import type { ProductionActivityDefinition } from "@runemark/domain";

export const craftReinforcedOakShield = {
  id: "craft-reinforced-oak-shield",
  kind: "production",
  name: "Craft Reinforced Oak Shield",
  skillId: "woodworking",
  durationMs: 60_000,
  experiencePerAction: 55,
  requiredFacility: ["workshop"],
  requirements: [{ skillId: "woodworking", level: 20 }],
  inputs: [
    { itemId: "oak-shield", quantity: 1 },
    { itemId: "brass-ingot", quantity: 2 },
  ],
  outputs: [{ itemId: "reinforced-oak-shield", quantity: 1 }],
} satisfies ProductionActivityDefinition;
