import type { CombatActivityDefinition } from "@runemark/domain";

export const fightBlackBear = {
  id: "fight-black-bear",
  kind: "combat",
  name: "Fight Black Bears",
  monsterId: "black-bear",
} satisfies CombatActivityDefinition;
