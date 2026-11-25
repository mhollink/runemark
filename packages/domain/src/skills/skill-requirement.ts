import type { SkillId } from "./skill";

export interface SkillRequirement {
  readonly skillId: SkillId;
  readonly level: number;
}
