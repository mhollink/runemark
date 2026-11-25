import type { CombatActivityDefinition } from "@runemark/domain";

export const fightCow = {
  id: "fight-cow",
  kind: "combat",
  name: "Fight Cows",
  monsterId: "cow",
} satisfies CombatActivityDefinition;
