export type SkillId = string;
export type SkillCategory = "gathering" | "production" | "combat" | "support";

export interface SkillDefinition {
  readonly id: SkillId;
  readonly name: string;
  readonly category: SkillCategory;
}
