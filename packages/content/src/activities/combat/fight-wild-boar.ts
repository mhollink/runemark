import type { CombatActivityDefinition } from "@runemark/domain";

export const fightWildBoar = {
  id: "fight-wild-boar",
  kind: "combat",
  name: "Fight Wild Boar",
  monsterId: "wild-boar",
} satisfies CombatActivityDefinition;
