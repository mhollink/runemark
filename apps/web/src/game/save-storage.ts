import { gameContent } from "@runemark/content";
import { type GameSave, SAVE_SCHEMA_VERSION } from "@runemark/domain";

export const SAVE_KEY = "runemark.save";

export type SaveLoadResult =
  | { readonly kind: "empty" }
  | { readonly kind: "loaded"; readonly save: GameSave }
  | { readonly kind: "invalid"; readonly message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUnsignedInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && typeof value === "number" && value >= 0;
}

function isInventory(value: unknown): boolean {
  if (!isRecord(value) || !Array.isArray(value.slots)) return false;

  const capacity = value.capacity;
  if (
    capacity !== null &&
    (!isUnsignedInteger(capacity) || value.slots.length > capacity)
  ) {
    return false;
  }

  return value.slots.every(
    (slot: unknown) =>
      isRecord(slot) &&
      typeof slot.itemId === "string" &&
      gameContent.items[slot.itemId] !== undefined &&
      isUnsignedInteger(slot.quantity) &&
      slot.quantity > 0,
  );
}

function isActivitySession(value: unknown): boolean {
  if (value === null) return true;
  if (!isRecord(value) || typeof value.siteId !== "string") {
    return false;
  }

  const site = gameContent.sites[value.siteId];
  const activity = site && gameContent.activities[site.activityId];

  if (!activity) return false;

  if (value.status !== "running" && value.status !== "blocked") {
    return false;
  }

  const phases = ["working", "banking", "travel-to-bank", "travel-to-site"];

  if (
    !phases.includes(String(value.phase)) ||
    !isUnsignedInteger(value.elapsedMs)
  ) {
    return false;
  }

  if (value.travel === null) {
    return value.phase === "working" || value.phase === "banking";
  }

  if (!isRecord(value.travel) || !Array.isArray(value.travel.legs)) {
    return false;
  }

  return (
    (value.phase === "travel-to-bank" || value.phase === "travel-to-site") &&
    value.travel.legs.length > 0 &&
    isUnsignedInteger(value.travel.index) &&
    value.travel.index < value.travel.legs.length &&
    value.travel.legs.every(
      (leg: unknown) =>
        isRecord(leg) &&
        typeof leg.routeId === "string" &&
        typeof leg.fromId === "string" &&
        typeof leg.toId === "string" &&
        gameContent.routes[leg.routeId] !== undefined &&
        isUnsignedInteger(leg.durationMs) &&
        leg.durationMs > 0,
    )
  );
}

function isGameSave(value: unknown): value is GameSave {
  if (!isRecord(value) || !isRecord(value.character)) {
    return false;
  }

  const character = value.character;

  return (
    value.schemaVersion === SAVE_SCHEMA_VERSION &&
    value.contentVersion === gameContent.version &&
    typeof value.id === "string" &&
    typeof character.id === "string" &&
    typeof character.name === "string" &&
    typeof character.locationId === "string" &&
    typeof character.nodeId === "string" &&
    gameContent.locations[character.locationId] !== undefined &&
    (gameContent.locations[character.nodeId] !== undefined ||
      gameContent.sites[character.nodeId] !== undefined) &&
    isUnsignedInteger(value.lastSimulatedAt) &&
    isUnsignedInteger(value.randomState) &&
    value.randomState <= 0xffffffff &&
    isUnsignedInteger(character.currentHitpoints) &&
    isRecord(character.skills) &&
    Object.values(character.skills).every(isUnsignedInteger) &&
    isInventory(character.backpack) &&
    isRecord(value.bank) &&
    isRecord(value.bank.items) &&
    Object.entries(value.bank.items).every(
      ([id, quantity]) =>
        gameContent.items[id] !== undefined && isUnsignedInteger(quantity),
    ) &&
    isActivitySession(value.activeActivity)
  );
}

export function loadGameSave(
  storage: Pick<Storage, "getItem">,
): SaveLoadResult {
  const raw = storage.getItem(SAVE_KEY);
  if (raw === null) return { kind: "empty" };

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!isRecord(parsed)) {
      return { kind: "invalid", message: "Invalid save data." };
    }

    if (
      parsed.schemaVersion !== SAVE_SCHEMA_VERSION ||
      parsed.contentVersion !== gameContent.version
    ) {
      return {
        kind: "invalid",
        message: "This save uses an incompatible game or content version.",
      };
    }

    if (!isGameSave(parsed)) {
      return { kind: "invalid", message: "Invalid save data." };
    }

    return { kind: "loaded", save: parsed };
  } catch {
    return { kind: "invalid", message: "Could not read saved game." };
  }
}

export function persistGameSave(
  storage: Pick<Storage, "setItem">,
  save: GameSave,
): void {
  storage.setItem(SAVE_KEY, JSON.stringify(save));
}
