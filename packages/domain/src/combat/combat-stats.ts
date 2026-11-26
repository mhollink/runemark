export type AttackType = "melee" | "ranged" | "magic";

export interface CombatStats {
  readonly maxHitpoints: number;

  readonly attackType: AttackType;
  readonly attackIntervalMs: number;
  readonly maxHit: number;
  readonly accuracy: number;

  readonly defense: Readonly<Record<AttackType, number>>;
}
