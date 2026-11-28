import type { GameContent } from "@runemark/content";
import { type GameSave, SAVE_SCHEMA_VERSION } from "@runemark/domain";
import { isActivityAvailableAtNode } from "@runemark/engine";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
};

const isUnsignedInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isWorldNode = (value: unknown, content: GameContent): value is string =>
  typeof value === "string" &&
  (Object.hasOwn(content.locations, value) ||
    Object.hasOwn(content.sites, value));

const isInventory = (value: unknown, content: GameContent): boolean => {
  if (
    !isRecord(value) ||
    !isUnsignedInteger(value.capacity) ||
    !Array.isArray(value.slots) ||
    value.slots.length > value.capacity
  ) {
    return false;
  }

  const stacks = new Set<string>();

  return Array.from(value.slots).every((slot: unknown) => {
    if (
      !isRecord(slot) ||
      typeof slot.itemId !== "string" ||
      !Object.hasOwn(content.items, slot.itemId) ||
      !isUnsignedInteger(slot.quantity) ||
      slot.quantity === 0
    ) {
      return false;
    }

    const item = content.items[slot.itemId];

    if (!item) return false;
    if (!item.stackable) return slot.quantity === 1;
    if (stacks.has(slot.itemId)) return false;

    stacks.add(slot.itemId);

    return true;
  });
};

const isBank = (value: unknown, content: GameContent): boolean =>
  isRecord(value) &&
  isRecord(value.items) &&
  Object.entries(value.items).every(
    ([itemId, quantity]) =>
      Object.hasOwn(content.items, itemId) &&
      isUnsignedInteger(quantity) &&
      quantity > 0,
  );

const isCharacter = (value: unknown, content: GameContent): boolean => {
  if (!isRecord(value)) return false;

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    typeof value.locationId === "string" &&
    Object.hasOwn(content.locations, value.locationId) &&
    isWorldNode(value.nodeId, content) &&
    isUnsignedInteger(value.currentHitpoints) &&
    isUnsignedInteger(value.coins) &&
    isRecord(value.skills) &&
    Object.entries(value.skills).every(
      ([skillId, experience]) =>
        Object.hasOwn(content.skills, skillId) && isUnsignedInteger(experience),
    ) &&
    isInventory(value.backpack, content)
  );
};

const isCombatProgress = (value: unknown): boolean =>
  isRecord(value) &&
  isUnsignedInteger(value.monsterHitpoints) &&
  isUnsignedInteger(value.playerAttackElapsedMs) &&
  isUnsignedInteger(value.monsterAttackElapsedMs);

const isTravelLeg = (value: unknown, content: GameContent): boolean => {
  if (
    !isRecord(value) ||
    typeof value.routeId !== "string" ||
    !Object.hasOwn(content.routes, value.routeId) ||
    !isWorldNode(value.fromId, content) ||
    !isWorldNode(value.toId, content) ||
    !isUnsignedInteger(value.durationMs) ||
    value.durationMs === 0
  ) {
    return false;
  }

  const route = content.routes[value.routeId];

  if (!route) return false;

  return (
    (route.fromId === value.fromId && route.toId === value.toId) ||
    (route.toId === value.fromId && route.fromId === value.toId)
  );
};

const isTravelProgress = (value: unknown, content: GameContent): boolean =>
  isRecord(value) &&
  Array.isArray(value.legs) &&
  value.legs.length > 0 &&
  isUnsignedInteger(value.index) &&
  value.index < value.legs.length &&
  Array.from(value.legs).every((leg: unknown) => isTravelLeg(leg, content));

const isActivitySession = (value: unknown, content: GameContent): boolean => {
  if (value === null) return true;

  if (
    !isRecord(value) ||
    !isWorldNode(value.nodeId, content) ||
    typeof value.activityId !== "string" ||
    !Object.hasOwn(content.activities, value.activityId) ||
    !isUnsignedInteger(value.elapsedMs)
  ) {
    return false;
  }

  const activity = content.activities[value.activityId];

  if (
    !activity ||
    !isActivityAvailableAtNode(content, value.nodeId, activity)
  ) {
    return false;
  }

  if (value.status !== "running" && value.status !== "blocked") {
    return false;
  }

  if (
    value.combat !== undefined &&
    (activity.kind !== "combat" ||
      value.phase !== "working" ||
      !isCombatProgress(value.combat))
  ) {
    return false;
  }

  switch (value.phase) {
    case "working":
    case "banking":
      return value.travel === null;

    case "travel-to-bank":
    case "travel-to-activity":
      return isTravelProgress(value.travel, content);

    default:
      return false;
  }
};

export const isGameSave = (
  value: unknown,
  content: GameContent,
): value is GameSave => {
  if (!isRecord(value)) return false;

  return (
    value.schemaVersion === SAVE_SCHEMA_VERSION &&
    value.contentVersion === content.version &&
    isNonEmptyString(value.id) &&
    isUnsignedInteger(value.lastSimulatedAt) &&
    isUnsignedInteger(value.randomState) &&
    value.randomState <= 0xffffffff &&
    isCharacter(value.character, content) &&
    isBank(value.bank, content) &&
    isActivitySession(value.activeActivity, content)
  );
};
