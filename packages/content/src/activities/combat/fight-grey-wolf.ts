import type { CombatActivityDefinition } from "@runemark/domain";

export const fightGreyWolf = {
  id: "fight-grey-wolf",
  kind: "combat",
  name: "Fight Grey Wolves",
  monsterId: "grey-wolf",
} satisfies CombatActivityDefinition;
