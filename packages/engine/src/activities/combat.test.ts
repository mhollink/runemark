import {
  experienceForLevel,
  levelForSkill,
  maxHitpointsForCharacter,
} from "@runemark/domain";
import { describe, expect, it } from "vitest";
import { advanceGame, executeCommand, getPlayerCombatStats } from "../index";
import { createTestGame, START } from "../testing/game-fixtures";

function startCombat() {
  const initial = createTestGame();
  return executeCommand(
    {
      ...initial,
      character: {
        ...initial.character,
        skills: {
          ...initial.character.skills,
          constitution: experienceForLevel(11) - 3,
        },
      },
    },
    {
      type: "START_ACTIVITY",
      siteId: "eldvik-farm",
      activityId: "fight-chicken",
    },
    START,
  ).state;
}

describe("combat activity", () => {
  it("uses Constitution for maximum hitpoints", () => {
    const { character } = createTestGame();
    expect(getPlayerCombatStats(character).maxHitpoints).toBe(10);
    expect(
      getPlayerCombatStats({
        ...character,
        skills: { ...character.skills, constitution: experienceForLevel(15) },
      }).maxHitpoints,
    ).toBe(15);
  });

  it("increases Constitution while fighting", () => {
    const result = advanceGame(startCombat(), START + 60_000);
    expect(result.summary.completedActions).toBeGreaterThan(0);
    expect(
      levelForSkill(result.state.character.skills, "constitution"),
    ).toBeGreaterThanOrEqual(11);
    expect(
      maxHitpointsForCharacter(result.state.character),
    ).toBeGreaterThanOrEqual(11);
  });

  it("remains deterministic while leveling Constitution", () => {
    const initial = startCombat();
    const until = START + 3_600_000;
    const direct = advanceGame(initial, until);
    let chunked = initial;
    for (let at = START + 10_000; at <= until; at += 10_000) {
      chunked = advanceGame(chunked, at).state;
    }
    expect(chunked).toEqual(direct.state);
  });
});
