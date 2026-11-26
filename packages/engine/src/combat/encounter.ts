import type { CombatProgress, CombatStats } from "@runemark/domain";
import { resolveAttack } from "./resolve-attack";

export interface EncounterState {
  readonly progress: CombatProgress;
  readonly playerHitpoints: number;
  readonly randomState: number;
}

export type CombatOutcome = "ongoing" | "monster-killed" | "player-killed";

export interface EncounterResult extends EncounterState {
  readonly consumedMs: number;
  readonly outcome: CombatOutcome;
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
  if (!Number.isSafeInteger(availableMs) || availableMs < 0) {
    throw new RangeError("Invalid encounter duration");
  }
  assertAttackTiming(
    player.attackIntervalMs,
    state.progress.playerAttackElapsedMs,
  );
  assertAttackTiming(
    monster.attackIntervalMs,
    state.progress.monsterAttackElapsedMs,
  );

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
      const attack = applyAttack(player, monster, monsterHitpoints, randomState);

      randomState = attack.randomState;
      playerAttackElapsedMs = 0;

      monsterHitpoints = attack.hitpoints;
    }

    if (monsterHitpoints === 0) {
      break;
    }

    if (monsterAttackElapsedMs >= monster.attackIntervalMs) {
      const attack = applyAttack(monster, player, playerHitpoints, randomState);

      randomState = attack.randomState;
      monsterAttackElapsedMs = 0;

      playerHitpoints = attack.hitpoints;
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
    outcome: determineOutcome(playerHitpoints, monsterHitpoints),
  };
}

function assertAttackTiming(intervalMs: number, elapsedMs: number): void {
  if (
    !Number.isSafeInteger(intervalMs) ||
    intervalMs <= 0 ||
    !Number.isSafeInteger(elapsedMs) ||
    elapsedMs < 0 ||
    elapsedMs >= intervalMs
  ) {
    throw new RangeError("Invalid attack timing");
  }
}

function applyAttack(
  attacker: CombatStats,
  defender: CombatStats,
  targetHitpoints: number,
  randomState: number,
): { hitpoints: number; randomState: number } {
  const attack = resolveAttack(attacker, defender, randomState);
  return {
    hitpoints: Math.max(0, targetHitpoints - attack.damage),
    randomState: attack.randomState,
  };
}

function determineOutcome(
  playerHitpoints: number,
  monsterHitpoints: number,
): CombatOutcome {
  if (playerHitpoints === 0) return "player-killed";
  if (monsterHitpoints === 0) return "monster-killed";
  return "ongoing";
}
