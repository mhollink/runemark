import type { CombatActivityDefinition } from "@runemark/domain";

export const fightOutlawLeader = {
  id: "fight-outlaw-leader",
  kind: "combat",
  name: "Fight Outlaw Leader",
  monsterId: "outlaw-leader",
} satisfies CombatActivityDefinition;
