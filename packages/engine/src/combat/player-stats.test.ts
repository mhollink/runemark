import { experienceForLevel } from "@runemark/domain";
import { describe, expect, it } from "vitest";
import { createTestGame } from "../testing/game-fixtures";
import { getPlayerCombatStats } from "./player-stats";

describe("player combat stats", () => {
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
});
