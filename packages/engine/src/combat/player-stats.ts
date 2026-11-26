import {
  type Character,
  type CombatStats,
  maxHitpointsForCharacter,
} from "@runemark/domain";

export function getPlayerCombatStats(character: Character): CombatStats {
  // TODO: Calculate these values based on player levels and equipment.
  return {
    maxHitpoints: maxHitpointsForCharacter(character),
    attackType: "melee",
    attackIntervalMs: 2_500,
    maxHit: 2,
    accuracy: 0.8,
    defense: {
      magic: 0,
      melee: 0,
      ranged: 0,
    },
  };
}
