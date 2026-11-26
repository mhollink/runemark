import type { CombatStats } from "@runemark/domain";
import { nextRandom } from "../loot/random";

export interface AttackResult {
  readonly damage: number;
  readonly randomState: number;
}

export function resolveAttack(
  attacker: CombatStats,
  defender: CombatStats,
  randomState: number,
): AttackResult {
  const defense = defender.defense[attacker.attackType];
  const accuracy = effectiveAccuracy(attacker.accuracy, defense);
  const accuracyRoll = nextRandom(randomState);

  if (accuracyRoll.value >= accuracy) {
    return {
      damage: 0,
      randomState: accuracyRoll.randomState,
    };
  }

  const damageRoll = nextRandom(accuracyRoll.randomState);

  const baseDamage = Math.floor(damageRoll.value * attacker.maxHit) + 1;

  return {
    damage: applyWeakness(baseDamage, defense),
    randomState: damageRoll.randomState,
  };
}

/** Positive defense reduces hit chance; weaknesses affect damage instead. */
function effectiveAccuracy(accuracy: number, defense: number): number {
  return accuracy * (100 / (100 + Math.max(0, defense)));
}

function applyWeakness(damage: number, defense: number): number {
  return Math.round(damage * (1 + Math.max(0, -defense) / 100));
}
