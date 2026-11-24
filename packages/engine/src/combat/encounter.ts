import type { CombatProgress, CombatStats } from "@runemark/domain";
import { resolveAttack } from "./resolve-attack";

export interface EncounterState {
  readonly progress: CombatProgress;
  readonly playerHitpoints: number;
  readonly randomState: number;
}

export interface EncounterResult extends EncounterState {
  readonly consumedMs: number;
  readonly outcome: "ongoing" | "monster-killed" | "player-killed";
}

export function createEncounter(monster: CombatStats): CombatProgress {
  return {
    monsterHitpoints: monster.maxHitpoints,
    playerAttackElapsedMs: 0,
    monsterAttackElapsedMs: 0,
  };
}

export function advanceEncounter(
  state: EncounterState,
  player: CombatStats,
  monster: CombatStats,
  availableMs: number,
): EncounterResult {
  let remainingMs = availableMs;
  let playerHitpoints = state.playerHitpoints;
  let randomState = state.randomState;

  let { monsterHitpoints, playerAttackElapsedMs, monsterAttackElapsedMs } =
    state.progress;

  while (remainingMs > 0 && playerHitpoints > 0 && monsterHitpoints > 0) {
    const playerRemaining = player.attackIntervalMs - playerAttackElapsedMs;

    const monsterRemaining = monster.attackIntervalMs - monsterAttackElapsedMs;

    const advance = Math.min(remainingMs, playerRemaining, monsterRemaining);

    remainingMs -= advance;
    playerAttackElapsedMs += advance;
    monsterAttackElapsedMs += advance;

    // Player has priority when both attacks occur
    // at exactly the same timestamp.
    if (playerAttackElapsedMs >= player.attackIntervalMs) {
      const attack = resolveAttack(player, randomState);

      randomState = attack.randomState;
      playerAttackElapsedMs = 0;

      monsterHitpoints = Math.max(0, monsterHitpoints - attack.damage);
    }

    if (monsterHitpoints === 0) {
      break;
    }

    if (monsterAttackElapsedMs >= monster.attackIntervalMs) {
      const attack = resolveAttack(monster, randomState);

      randomState = attack.randomState;
      monsterAttackElapsedMs = 0;

      playerHitpoints = Math.max(0, playerHitpoints - attack.damage);
    }
  }

  return {
    consumedMs: availableMs - remainingMs,
    playerHitpoints,
    randomState,
    progress: {
      monsterHitpoints,
      playerAttackElapsedMs,
      monsterAttackElapsedMs,
    },
    outcome:
      playerHitpoints === 0
        ? "player-killed"
        : monsterHitpoints === 0
          ? "monster-killed"
          : "ongoing",
  };
}
