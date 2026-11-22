import { describe, expect, it } from "vitest";
import {
  createExperienceTable,
  experienceForLevel,
  experienceUntilNextLevel,
  levelForExperience,
} from "./experience-table";

const thresholds = Array.from({ length: 99 }, (_, index) => index * 100);
const table = createExperienceTable(thresholds);

describe("ExperienceTable", () => {
  it("uses level 1 at zero XP and exactly 99 levels", () => {
    expect(experienceForLevel(table, 1)).toBe(0);
    expect(experienceForLevel(table, 99)).toBe(9800);
    expect(levelForExperience(table, 0)).toBe(1);
  });

  it("levels up exactly at the cumulative threshold", () => {
    expect(levelForExperience(table, 199)).toBe(2);
    expect(levelForExperience(table, 200)).toBe(3);
    expect(levelForExperience(table, 9800)).toBe(99);
    expect(levelForExperience(table, 1_000_000)).toBe(99);
  });

  it("reports remaining XP without a next level after 99", () => {
    expect(experienceUntilNextLevel(table, 199)).toBe(1);
    expect(experienceUntilNextLevel(table, 9800)).toBeNull();
  });

  it("does not retain a mutable reference to the source thresholds", () => {
    const input = [...thresholds];
    const snapshot = createExperienceTable(input);
    input[1] = 12345;
    expect(experienceForLevel(snapshot, 2)).toBe(100);
  });

  it("rejects invalid level tables and invalid XP", () => {
    expect(() => createExperienceTable([0, 100])).toThrow(RangeError);
    expect(() => createExperienceTable([1, ...thresholds.slice(1)])).toThrow(
      RangeError,
    );
    expect(() => createExperienceTable([0, 0, ...thresholds.slice(2)])).toThrow(
      RangeError,
    );
    expect(() =>
      createExperienceTable([0, -1, ...thresholds.slice(2)]),
    ).toThrow(RangeError);
    expect(() => levelForExperience(table, -1)).toThrow(RangeError);
    expect(() => levelForExperience(table, 1.5)).toThrow(RangeError);
    expect(() => experienceForLevel(table, 100)).toThrow(RangeError);
  });
});
