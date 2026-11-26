import type { CombatStats } from "@runemark/domain";
import { describe, expect, it } from "vitest";
import { advanceEncounter, createEncounter } from "./encounter";

const player: CombatStats = {
  maxHitpoints: 10,
  attackType: "melee",
  attackIntervalMs: 2_000,
  maxHit: 1,
  accuracy: 1,
  defense: {
    magic: 0,
    melee: 0,
    ranged: 0,
  },
};
const monster: CombatStats = {
  maxHitpoints: 3,
  attackType: "melee",
  attackIntervalMs: 3_000,
  maxHit: 1,
  accuracy: 1,
  defense: {
    magic: 0,
    melee: 0,
    ranged: 0,
  },
};

function createState() {
  return {
    progress: createEncounter(monster),
    playerHitpoints: 10,
    randomState: 42,
  };
}

describe("combat encounter", () => {
  it("preserves partial attack timers", () => {
    const result = advanceEncounter(createState(), player, monster, 1_000);
    expect(result.outcome).toBe("ongoing");
    expect(result.progress).toEqual({
      monsterHitpoints: 3,
      playerAttackElapsedMs: 1_000,
      monsterAttackElapsedMs: 1_000,
    });
  });

  it("uses independent attack intervals", () => {
    const result = advanceEncounter(createState(), player, monster, 3_000);
    expect(result.playerHitpoints).toBe(9);
    expect(result.progress.monsterHitpoints).toBe(2);
  });

  it("gives the player priority on simultaneous lethal attacks", () => {
    const result = advanceEncounter(createState(), player, monster, 60_000);
    expect(result.outcome).toBe("monster-killed");
    expect(result.consumedMs).toBe(6_000);
    expect(result.playerHitpoints).toBe(9);
  });

  it("stops when the player is defeated", () => {
    const result = advanceEncounter(
      { ...createState(), playerHitpoints: 1 },
      { ...player, accuracy: 0 },
      monster,
      60_000,
    );
    expect(result.outcome).toBe("player-killed");
    expect(result.consumedMs).toBe(3_000);
    expect(result.playerHitpoints).toBe(0);
  });

  it("applies the defender's rating to attacks in both directions", () => {
    const result = advanceEncounter(
      createState(),
      { ...player, defense: { ...player.defense, melee: -100 } },
      { ...monster, defense: { ...monster.defense, melee: 300 } },
      3_000,
    );
    expect(result.progress.monsterHitpoints).toBe(3);
    expect(result.playerHitpoints).toBe(8);
  });

  it("uses the attack type when a player exploits a weakness", () => {
    const result = advanceEncounter(
      createState(),
      { ...player, attackType: "ranged" },
      { ...monster, defense: { ...monster.defense, ranged: -100 } },
      2_000,
    );
    expect(result.progress.monsterHitpoints).toBe(1);
  });

  it("is deterministic with resistances and weaknesses", () => {
    const initial = createState();
    const resistantPlayer = {
      ...player,
      defense: { ...player.defense, melee: 50 },
    };
    const weakMonster = {
      ...monster,
      defense: { ...monster.defense, melee: -50 },
    };
    const direct = advanceEncounter(
      initial,
      resistantPlayer,
      weakMonster,
      3_500,
    );
    const first = advanceEncounter(
      initial,
      resistantPlayer,
      weakMonster,
      1_500,
    );
    const second = advanceEncounter(first, resistantPlayer, weakMonster, 2_000);
    expect(second.progress).toEqual(direct.progress);
    expect(second.randomState).toBe(direct.randomState);
    expect(second.playerHitpoints).toBe(direct.playerHitpoints);
    expect(second.outcome).toBe(direct.outcome);
    expect(first.consumedMs + second.consumedMs).toBe(direct.consumedMs);
  });

  it("rejects invalid attack intervals and elapsed times", () => {
    expect(() =>
      advanceEncounter(
        createState(),
        { ...player, attackIntervalMs: 0 },
        monster,
        60_000,
      ),
    ).toThrow(RangeError);
    const initial = createState();
    expect(() =>
      advanceEncounter(
        {
          ...initial,
          progress: { ...initial.progress, playerAttackElapsedMs: -1 },
        },
        player,
        monster,
        60_000,
      ),
    ).toThrow(RangeError);
  });

  it("is deterministic across simulation boundaries", () => {
    const initial = createState();
    const direct = advanceEncounter(initial, player, monster, 5_000);
    const first = advanceEncounter(initial, player, monster, 2_500);
    const second = advanceEncounter(first, player, monster, 2_500);
    expect(second.progress).toEqual(direct.progress);
    expect(second.randomState).toBe(direct.randomState);
    expect(second.playerHitpoints).toBe(direct.playerHitpoints);
  });
});
