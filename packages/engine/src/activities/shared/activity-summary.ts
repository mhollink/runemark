import {
  awardSkillExperience,
  type ItemQuantity,
  maxHitpointsForCharacter,
  type SkillId,
} from "@runemark/domain";
import type { ActivityRuntime } from "./activity-runtime";

export interface ActivitySummary {
  completedActions: number;
  bankTrips: number;
  readonly itemsGained: Record<string, number>;
  readonly itemsConsumed: Record<string, number>;
  readonly itemsBanked: Record<string, number>;
  readonly experienceGained: Record<string, number>;
}

export function createActivitySummary(): ActivitySummary {
  return {
    completedActions: 0,
    bankTrips: 0,
    itemsGained: {},
    itemsConsumed: {},
    itemsBanked: {},
    experienceGained: {},
  };
}

export function incrementQuantity(
  ledger: Record<string, number>,
  id: string,
  quantity: number,
): void {
  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    throw new RangeError("Invalid quantity");
  }
  const previous = Object.hasOwn(ledger, id) ? (ledger[id] ?? 0) : 0;
  const total = previous + quantity;
  if (!Number.isSafeInteger(total)) {
    throw new RangeError(`Quantity overflow for ${id}`);
  }
  Object.defineProperty(ledger, id, {
    value: total,
    writable: true,
    enumerable: true,
    configurable: true,
  });
}

export function recordItems(
  ledger: Record<string, number>,
  items: readonly ItemQuantity[],
): void {
  for (const { itemId, quantity } of items) {
    incrementQuantity(ledger, itemId, quantity);
  }
}

export function awardExperience(
  runtime: ActivityRuntime,
  skillId: SkillId,
  amount: number,
): void {
  const previous = runtime.character;
  const updated = {
    ...previous,
    skills: awardSkillExperience(previous.skills, skillId, amount),
  };
  // Constitution gains increase current HP by the same amount, without reviving.
  const gainedHitpoints =
    skillId === "constitution"
      ? maxHitpointsForCharacter(updated) - maxHitpointsForCharacter(previous)
      : 0;
  runtime.character = {
    ...updated,
    currentHitpoints:
      previous.currentHitpoints > 0
        ? previous.currentHitpoints + gainedHitpoints
        : 0,
  };
  incrementQuantity(runtime.summary.experienceGained, skillId, amount);
}
