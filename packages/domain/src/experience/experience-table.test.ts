import { describe, expect, it } from "vitest";
import {
  experienceForLevel,
  experienceUntilNextLevel,
  levelForExperience,
  MAX_SKILL_LEVEL,
  progressTowardsNextLevel,
} from "./experience-table";

describe("ExperienceTable", () => {
  it("uses level 1 at zero XP and exactly 99 levels", () => {
    expect(experienceForLevel(1)).toBe(0);
    expect(experienceForLevel(99)).toBe(10249141);
    expect(levelForExperience(0)).toBe(1);
  });

  it("levels up exactly at the cumulative threshold", () => {
    [
      { exp: 418, level: 5 },
      { exp: 2517, level: 15 },
      { exp: 13376, level: 30 },
      { exp: 58735, level: 45 },
      { exp: 248219, level: 60 },
      { exp: 645254, level: 70 },
      { exp: 1675061, level: 80 },
      { exp: 4346117, level: 90 },
      { exp: 10249141, level: 99 },
    ].forEach(({ exp, level }) => {
      expect(
        levelForExperience(exp),
        `expected ${level} to be reached at ${exp}.`,
      ).toBe(level);
    });
  });

  it("levels up exactly at every experience threshold", () => {
    for (let level = 2; level <= MAX_SKILL_LEVEL; level++) {
      const threshold = experienceForLevel(level);

      expect(levelForExperience(threshold)).toBe(level);
      expect(levelForExperience(threshold - 1)).toBe(level - 1);
    }
  });

  it("reports remaining XP without a next level after 99", () => {
    expect(experienceUntilNextLevel(417)).toBe(1);
    expect(experienceUntilNextLevel(10_249_141)).toBeNull();
  });

  it("rejects invalid levels and experience", () => {
    expect(() => experienceForLevel(0)).toThrow(RangeError);
    expect(() => experienceForLevel(100)).toThrow(RangeError);
    expect(() => experienceForLevel(1.5)).toThrow(RangeError);
    expect(() => levelForExperience(-1)).toThrow(RangeError);
    expect(() => levelForExperience(1.5)).toThrow(RangeError);
    expect(() => levelForExperience(NaN)).toThrow(RangeError);
  });

  it("shows the progress towards the next level", () => {
    expect(progressTowardsNextLevel(418)).toBe(0);
    expect(progressTowardsNextLevel(417).toFixed(2)).toBe("0.99");
    expect(progressTowardsNextLevel(358).toFixed(2)).toBe("0.50");
    expect(progressTowardsNextLevel(10_000).toFixed(2)).toBe("0.16");
    expect(progressTowardsNextLevel(10249141)).toBe(1);
  });
});
