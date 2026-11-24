import { assertNonNegativeSafeInteger } from "../shared/validation";

export const MIN_SKILL_LEVEL = 1;
export const MAX_SKILL_LEVEL = 99;

const BASE_LEVEL_XP = 90;
const XP_GROWTH_RATE = 1.1;

function generateExperienceTable(): readonly number[] {
  const thresholds: number[] = [0];

  let cumulativeXp = 0;

  for (let level = MIN_SKILL_LEVEL; level < MAX_SKILL_LEVEL; level++) {
    const requiredXp = Math.round(
      BASE_LEVEL_XP * XP_GROWTH_RATE ** (level - 1),
    );

    cumulativeXp += requiredXp;
    thresholds.push(cumulativeXp);
  }

  return thresholds;
}

const EXPERIENCE_TABLE = generateExperienceTable();

export function experienceForLevel(level: number): number {
  if (
    !Number.isInteger(level) ||
    level < MIN_SKILL_LEVEL ||
    level > MAX_SKILL_LEVEL
  ) {
    throw new RangeError(
      `Level must be between ${MIN_SKILL_LEVEL} and ${MAX_SKILL_LEVEL}`,
    );
  }

  const experience = EXPERIENCE_TABLE[level - 1];

  if (experience === undefined) {
    throw new RangeError(`Missing XP threshold for level ${level}`);
  }

  return experience;
}

export function levelForExperience(experience: number): number {
  assertNonNegativeSafeInteger(experience, "Experience");

  let low = MIN_SKILL_LEVEL;
  let high = MAX_SKILL_LEVEL;

  while (low < high) {
    const middle = Math.ceil((low + high) / 2);

    if (experienceForLevel(middle) <= experience) {
      low = middle;
    } else {
      high = middle - 1;
    }
  }

  return low;
}

export function experienceUntilNextLevel(experience: number): number | null {
  const level = levelForExperience(experience);

  return level === MAX_SKILL_LEVEL
    ? null
    : experienceForLevel(level + 1) - experience;
}
