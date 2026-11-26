import type { CombatStats } from "@runemark/domain";
import { describe, expect, it } from "vitest";
import { nextRandom } from "../loot/random";
import { resolveAttack } from "./resolve-attack";

const seed = 42;
const attacker: CombatStats = {
  maxHitpoints: 10,
  attackType: "melee",
  attackIntervalMs: 2_000,
  maxHit: 20,
  accuracy: 1,
  defense: { melee: 0, ranged: 0, magic: 0 },
};
const defender: CombatStats = {
  ...attacker,
  defense: { melee: 0, ranged: 0, magic: 0 },
};

function withDefense(melee: number): CombatStats {
  return { ...defender, defense: { ...defender.defense, melee } };
}

describe("attack resolution", () => {
  it("preserves neutral damage and consumes two rolls on a hit", () => {
    const hitRoll = nextRandom(seed);
    const damageRoll = nextRandom(hitRoll.randomState);
    expect(resolveAttack(attacker, defender, seed)).toEqual({
      damage: 2,
      randomState: damageRoll.randomState,
    });
  });

  it("reduces hit chance with positive defense", () => {
    expect(resolveAttack(attacker, withDefense(300), seed)).toEqual({
      damage: 0,
      randomState: nextRandom(seed).randomState,
    });
  });

  it("does not reduce damage on a successful hit against positive defense", () => {
    expect(resolveAttack(attacker, withDefense(100), seed)).toEqual(
      resolveAttack(attacker, defender, seed),
    );
  });

  it("increases successful damage against negative defense", () => {
    const neutral = resolveAttack(attacker, defender, seed);
    expect(resolveAttack(attacker, withDefense(-50), seed)).toEqual({
      damage: 3,
      randomState: neutral.randomState,
    });
    expect(resolveAttack(attacker, withDefense(-100), seed).damage).toBe(4);
    expect(resolveAttack(attacker, withDefense(-200), seed).damage).toBe(6);
  });

  it("does not increase accuracy against weaknesses", () => {
    const inaccurate = { ...attacker, accuracy: 0.25 };
    expect(resolveAttack(inaccurate, withDefense(-200), seed)).toEqual({
      damage: 0,
      randomState: nextRandom(seed).randomState,
    });
  });

  it("rounds fractional bonus damage to the nearest integer", () => {
    expect(resolveAttack(attacker, withDefense(-25), seed).damage).toBe(3);
  });

  it("only considers defense against the attacker's attack type", () => {
    const target = {
      ...defender,
      defense: { melee: 300, ranged: -50, magic: 0 },
    };
    expect(resolveAttack(attacker, target, seed).damage).toBe(0);
    expect(
      resolveAttack({ ...attacker, attackType: "ranged" }, target, seed).damage,
    ).toBe(3);
    expect(
      resolveAttack({ ...attacker, attackType: "magic" }, target, seed).damage,
    ).toBe(2);
  });
});
