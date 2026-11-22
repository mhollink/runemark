import { describe, expect, it } from "vitest";
import { createExperienceTable } from "../experience/experience-table";
import {
  awardSkillExperience,
  experienceForSkill,
  levelForSkill,
  type SkillProgress,
} from "./skill-progress";

const table = createExperienceTable(
  Array.from({ length: 99 }, (_, index) => index * 100),
);

describe("SkillProgress", () => {
  it("starts every skill at zero experience and derives level one", () => {
    expect(experienceForSkill({}, "mining")).toBe(0);
    expect(levelForSkill({}, "woodcutting", table)).toBe(1);
  });

  it("keeps skill progression independent without changing the original state", () => {
    const original: SkillProgress = { mining: 50 };
    const updated = awardSkillExperience(original, "woodcutting", 210);
    expect(updated).toEqual({ mining: 50, woodcutting: 210 });
    expect(original).toEqual({ mining: 50 });
    expect(levelForSkill(updated, "woodcutting", table)).toBe(3);
    expect(levelForSkill(updated, "mining", table)).toBe(1);
  });

  it("rejects invalid awards and overflows", () => {
    expect(() => awardSkillExperience({}, "mining", 0)).toThrow(RangeError);
    expect(() => awardSkillExperience({}, "mining", -4)).toThrow(RangeError);
    expect(() => awardSkillExperience({}, " ", 4)).toThrow(RangeError);
    expect(() =>
      awardSkillExperience({ mining: Number.MAX_SAFE_INTEGER }, "mining", 1),
    ).toThrow(RangeError);
  });
});
