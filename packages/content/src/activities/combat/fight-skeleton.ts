import type { CombatActivityDefinition } from "@runemark/domain";

export const fightSkeleton = {
  id: "fight-skeleton",
  kind: "combat",
  name: "Fight Skeleton",
  monsterId: "skeleton",
} satisfies CombatActivityDefinition;
