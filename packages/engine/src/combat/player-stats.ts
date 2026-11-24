import type { Character, CombatStats } from "@runemark/domain";

export function getPlayerCombatStats(_character: Character): CombatStats {
  return {
    maxHitpoints: 10,
    attackType: "melee",
    attackIntervalMs: 2_500,
    maxHit: 2,
    accuracy: 0.8,
  };
}
