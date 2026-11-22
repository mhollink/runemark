import { assertNonNegativeSafeInteger } from "../shared/validation";

export const MIN_SKILL_LEVEL = 1;
export const MAX_SKILL_LEVEL = 99;

/** The XP needed to reach each level, starting with zero XP for level 1. */
export interface ExperienceTable {
  readonly cumulativeXp: readonly number[];
}

/** Validates and snapshots the one shared curve used by all skills. */
export function createExperienceTable(
  thresholds: readonly number[],
): ExperienceTable {
  if (thresholds.length !== MAX_SKILL_LEVEL || thresholds[0] !== 0) {
    throw new RangeError(
      `Expected ${MAX_SKILL_LEVEL} levels, starting at zero XP`,
    );
  }

  for (let index = 0; index < thresholds.length; index++) {
    const xp = thresholds[index];
    if (xp === undefined) {
      throw new RangeError(`Missing XP threshold for level ${index + 1}`);
    }
    assertNonNegativeSafeInteger(xp, `Level ${index + 1} threshold`);
    if (index > 0 && xp <= (thresholds[index - 1] ?? 0)) {
      throw new RangeError(
        "XP thresholds must increase strictly with each level",
      );
    }
  }

  return { cumulativeXp: [...thresholds] };
}

export function experienceForLevel(
  table: ExperienceTable,
  level: number,
): number {
  if (
    !Number.isInteger(level) ||
    level < MIN_SKILL_LEVEL ||
    level > MAX_SKILL_LEVEL
  ) {
    throw new RangeError(
      `Level must be between ${MIN_SKILL_LEVEL} and ${MAX_SKILL_LEVEL}`,
    );
  }
  const experience = table.cumulativeXp[level - 1];
  if (experience === undefined) {
    throw new RangeError(`Missing XP threshold for level ${level}`);
  }
  return experience;
}

/** Levels are derived, never stored independently from XP. */
export function levelForExperience(
  table: ExperienceTable,
  experience: number,
): number {
  assertNonNegativeSafeInteger(experience, "Experience");

  let low = 0;
  let high = table.cumulativeXp.length - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const threshold = table.cumulativeXp[middle];
    if (threshold === undefined) {
      throw new RangeError(`Missing XP threshold at index ${middle}`);
    }
    if (threshold <= experience) {
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return high + 1;
}

/** Returns null when level 99 has been reached. */
export function experienceUntilNextLevel(
  table: ExperienceTable,
  experience: number,
): number | null {
  const level = levelForExperience(table, experience);
  return level === MAX_SKILL_LEVEL
    ? null
    : experienceForLevel(table, level + 1) - experience;
}
