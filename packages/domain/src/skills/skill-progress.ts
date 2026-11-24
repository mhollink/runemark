import {
  experienceForLevel,
  levelForExperience,
  MIN_SKILL_LEVEL,
} from "../experience/experience-table";
import {
  assertNonEmptyString,
  assertPositiveSafeInteger,
} from "../shared/validation";
import type { SkillDefinition, SkillId } from "./skill";

/** A sparse XP ledger. An untrained skill starts at zero XP. */
export type SkillProgress = Readonly<Record<SkillId, number>>;

export function experienceForSkill(
  progress: SkillProgress,
  skillId: SkillId,
): number {
  assertNonEmptyString(skillId, "Skill ID");
  return Object.hasOwn(progress, skillId) ? (progress[skillId] ?? 0) : 0;
}

export function levelForSkill(
  progress: SkillProgress,
  skillId: SkillId,
): number {
  return levelForExperience(experienceForSkill(progress, skillId));
}

export function awardSkillExperience(
  progress: SkillProgress,
  skillId: SkillId,
  amount: number,
): SkillProgress {
  assertNonEmptyString(skillId, "Skill ID");
  assertPositiveSafeInteger(amount, "Experience award");
  const nextExperience = experienceForSkill(progress, skillId) + amount;
  if (!Number.isSafeInteger(nextExperience)) {
    throw new RangeError(
      "Total skill experience exceeds the safe integer limit",
    );
  }
  return { ...progress, [skillId]: nextExperience };
}

export function createSkillProgress(
  skills: readonly SkillDefinition[],
): SkillProgress {
  return Object.fromEntries(
    skills.map((skill) => [
      skill.id,
      experienceForLevel(skill.initialLevel ?? MIN_SKILL_LEVEL),
    ]),
  );
}
