import type { CombatStats } from "@runemark/domain";
import { nextRandom } from "../loot/random";

export interface AttackResult {
  readonly damage: number;
  readonly randomState: number;
}

export function resolveAttack(
  attacker: CombatStats,
  randomState: number,
): AttackResult {
  const accuracyRoll = nextRandom(randomState);

  if (accuracyRoll.value >= attacker.accuracy) {
    return {
      damage: 0,
      randomState: accuracyRoll.randomState,
    };
  }

  const damageRoll = nextRandom(accuracyRoll.randomState);

  return {
    damage: Math.floor(damageRoll.value * attacker.maxHit) + 1,
    randomState: damageRoll.randomState,
  };
}
