import type { CombatActivityDefinition } from "@runemark/domain";

export const fightChicken = {
  id: "fight-chicken",
  kind: "combat",
  name: "Fight Chicken",
  monsterId: "chicken",
} satisfies CombatActivityDefinition;
