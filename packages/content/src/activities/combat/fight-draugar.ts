import type { CombatActivityDefinition } from "@runemark/domain";

export const fightDraugar = {
  id: "fight-draugar",
  kind: "combat",
  name: "Fight Draugar",
  monsterId: "draugar",
} satisfies CombatActivityDefinition;
