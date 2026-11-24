import {
  type Character,
  type CombatStats,
  maxHitpointsForCharacter,
} from "@runemark/domain";

export function getPlayerCombatStats(character: Character): CombatStats {
  return {
    maxHitpoints: maxHitpointsForCharacter(character),
    attackType: "melee",
    attackIntervalMs: 2_500,
    maxHit: 2,
    accuracy: 0.8,
  };
}
