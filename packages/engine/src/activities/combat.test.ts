import {
  experienceForLevel,
  levelForSkill,
  maxHitpointsForCharacter,
} from "@runemark/domain";
import { describe, expect, it } from "vitest";
import {
  advanceTestGame,
  createTestGame,
  executeTestCommand,
  START,
} from "../testing/game-fixtures";

function startCombat() {
  const initial = createTestGame();
  return executeTestCommand(
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
      nodeId: "test-farm",
      activityId: "fight-chicken",
    },
    START,
  ).state;
}

describe("combat activity", () => {
  it("increases Constitution while fighting", () => {
    const result = advanceTestGame(startCombat(), START + 60_000);
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
    const direct = advanceTestGame(initial, until);
    let chunked = initial;
    for (let at = START + 10_000; at <= until; at += 10_000) {
      chunked = advanceTestGame(chunked, at).state;
    }
    expect(chunked).toEqual(direct.state);
  });
});
