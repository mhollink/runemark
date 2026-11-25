import type { CombatActivityDefinition } from "@runemark/domain";

export const fightZombie = {
  id: "fight-zombie",
  kind: "combat",
  name: "Fight Zombie",
  monsterId: "zombie",
} satisfies CombatActivityDefinition;
