import type { CombatActivityDefinition } from "@runemark/domain";

export const fightOutlaw = {
  id: "fight-outlaw",
  kind: "combat",
  name: "Fight Outlaw",
  monsterId: "outlaw",
} satisfies CombatActivityDefinition;
