import type { GameContent } from "@runemark/content";
import {
  type ActivityPhase,
  type ActivitySiteDefinition,
  addInventoryItem,
  availableInventorySlots,
  awardSkillExperience,
  depositInventory,
  type GameSave,
  type GatheringActivityDefinition,
  type Inventory,
  InventoryCapacityError,
  type ItemDrop,
  type TravelLeg,
  type TravelProgress,
} from "@runemark/domain";
import { BANKING_DURATION_MS } from "../logistics/config";
import { guaranteedDrops, resolveLoot } from "../loot/resolve-loot";
import { findNearestBank, findShortestRoute } from "../navigation/find-route";
import type { GameEvent, SimulationResult } from "../simulation-types";

function getItem(content: GameContent, itemId: string) {
  const item = content.items[itemId];

  if (!item) {
    throw new Error(`Unknown reward item: ${itemId}`);
  }

  return item;
}

/**
 * Can the next action produce at least one guaranteed reward?
 * Stackable items can still fit in an existing stack.
 */
function canGather(
  inventory: Inventory,
  drops: readonly ItemDrop[],
  content: GameContent,
): boolean {
  if (drops.length === 0) {
    return availableInventorySlots(inventory) !== 0;
  }

  return drops.some((drop) => {
    try {
      addInventoryItem(inventory, getItem(content, drop.itemId), drop.quantity);
      return true;
    } catch (error) {
      if (error instanceof InventoryCapacityError) {
        return false;
      }
      throw error;
    }
  });
}

/**
 * Store drops in their resolved order.
 * Drop entries that cannot fit are discarded.
 */
function storeDrops(
  inventory: Inventory,
  drops: readonly ItemDrop[],
  content: GameContent,
): {
  inventory: Inventory;
  accepted: readonly ItemDrop[];
} {
  let current = inventory;
  const accepted: ItemDrop[] = [];

  for (const drop of drops) {
    try {
      current = addInventoryItem(
        current,
        getItem(content, drop.itemId),
        drop.quantity,
      );
      accepted.push(drop);
    } catch (error) {
      if (error instanceof InventoryCapacityError) {
        continue;
      }
      throw error;
    }
  }

  return { inventory: current, accepted };
}

export function simulateGathering(
  state: GameSave,
  content: GameContent,
  site: ActivitySiteDefinition,
  activity: GatheringActivityDefinition,
  until: number,
): SimulationResult {
  const session = state.activeActivity;

  if (session?.status !== "running" || session.siteId !== site.id) {
    throw new Error("No matching active gathering session");
  }

  if (
    !Number.isSafeInteger(activity.durationMs) ||
    activity.durationMs <= 0 ||
    !Number.isSafeInteger(activity.experiencePerAction) ||
    activity.experiencePerAction <= 0
  ) {
    throw new RangeError(`Invalid activity: ${activity.id}`);
  }

  const phaseDuration =
    session.phase === "working"
      ? activity.durationMs
      : session.phase === "banking"
        ? BANKING_DURATION_MS
        : session.travel?.legs[session.travel.index]?.durationMs;

  if (
    phaseDuration === undefined ||
    !Number.isSafeInteger(session.elapsedMs) ||
    session.elapsedMs < 0 ||
    session.elapsedMs >= phaseDuration
  ) {
    throw new RangeError("Invalid phase progress");
  }

  let cursor = state.lastSimulatedAt;
  let phase: ActivityPhase = session.phase;
  let elapsedMs = session.elapsedMs;
  let travel: TravelProgress | null = session.travel;

  let nodeId = state.character.nodeId;
  let locationId = state.character.locationId;
  let backpack = state.character.backpack;
  let bank = state.bank;
  let randomState = state.randomState;

  let completedActions = 0;
  let bankTrips = 0;
  let blocked = false;

  const itemsGained: Record<string, number> = {};
  const itemsBanked: Record<string, number> = {};
  const events: GameEvent[] = [];
  const guaranteed = guaranteedDrops(activity.rewards, content);

  function beginTravel(
    destination: "travel-to-bank" | "travel-to-site",
    legs: readonly TravelLeg[],
  ): void {
    elapsedMs = 0;
    travel = legs.length > 0 ? { legs, index: 0 } : null;

    phase =
      legs.length > 0
        ? destination
        : destination === "travel-to-bank"
          ? "banking"
          : "working";
  }

  function startBankingOrBlock(): void {
    const route = findNearestBank(content, nodeId);

    if (route !== null && backpack.slots.length > 0) {
      beginTravel("travel-to-bank", route);
      return;
    }

    blocked = true;
    phase = "working";
    elapsedMs = 0;
    travel = null;

    events.push({
      type: "ACTIVITY_BLOCKED",
      siteId: site.id,
      activityId: activity.id,
      timestamp: cursor,
      reason: route === null ? "BANK_UNAVAILABLE" : "INVENTORY_FULL",
    });
  }

  while (cursor < until && !blocked) {
    if (phase === "travel-to-bank" || phase === "travel-to-site") {
      const leg = travel?.legs[travel.index];

      if (!leg || leg.fromId !== nodeId) {
        throw new Error("Invalid travel progress");
      }

      const advance = Math.min(until - cursor, leg.durationMs - elapsedMs);

      cursor += advance;
      elapsedMs += advance;

      if (elapsedMs < leg.durationMs) break;

      // The character has reached the next node.
      nodeId = leg.toId;
      elapsedMs = 0;

      const arrivedLocationId =
        content.sites[nodeId]?.locationId ??
        (content.locations[nodeId] ? nodeId : undefined);

      if (!arrivedLocationId) {
        throw new Error(`Unknown travel node: ${nodeId}`);
      }

      locationId = arrivedLocationId;

      if (travel && travel.index + 1 < travel.legs.length) {
        travel = { ...travel, index: travel.index + 1 };
      } else {
        travel = null;
        phase = phase === "travel-to-bank" ? "banking" : "working";
      }

      continue;
    }

    if (phase === "working") {
      if (nodeId !== site.id) {
        throw new Error(`Character is not at site ${site.id}`);
      }

      if (!canGather(backpack, guaranteed, content)) {
        startBankingOrBlock();
        continue;
      }
    }

    const duration =
      phase === "banking" ? BANKING_DURATION_MS : activity.durationMs;

    const advance = Math.min(until - cursor, duration - elapsedMs);

    cursor += advance;
    elapsedMs += advance;

    if (elapsedMs < duration) break;

    elapsedMs = 0;

    if (phase === "banking") {
      if (!content.locations[nodeId]?.facilities?.includes("bank")) {
        throw new Error(`No bank at ${nodeId}`);
      }

      bank = depositInventory(bank, backpack);

      for (const slot of backpack.slots) {
        const total = (itemsBanked[slot.itemId] ?? 0) + slot.quantity;

        if (!Number.isSafeInteger(total)) {
          throw new RangeError("Banking summary overflow");
        }

        itemsBanked[slot.itemId] = total;
      }

      backpack = { ...backpack, slots: [] };
      bankTrips++;

      const route = findShortestRoute(content, nodeId, site.id);

      if (route === null) {
        throw new Error(`No return route to ${site.id}`);
      }

      beginTravel("travel-to-site", route);
      continue;
    }

    // Gathering action completed.
    const loot = resolveLoot(activity.rewards, content, randomState);
    randomState = loot.randomState;
    completedActions++;

    const stored = storeDrops(backpack, loot.drops, content);
    backpack = stored.inventory;

    for (const drop of stored.accepted) {
      const total = (itemsGained[drop.itemId] ?? 0) + drop.quantity;

      if (!Number.isSafeInteger(total)) {
        throw new RangeError("Gathering item quantity overflow");
      }

      itemsGained[drop.itemId] = total;
    }

    if (!canGather(backpack, guaranteed, content)) {
      startBankingOrBlock();
    }
  }

  const experience = completedActions * activity.experiencePerAction;

  if (!Number.isSafeInteger(experience)) {
    throw new RangeError("Experience overflow");
  }

  return {
    state: {
      ...state,
      lastSimulatedAt: until,
      randomState,
      bank,
      character: {
        ...state.character,
        nodeId,
        locationId,
        backpack,
        skills:
          completedActions === 0
            ? state.character.skills
            : awardSkillExperience(
                state.character.skills,
                activity.skillId,
                experience,
              ),
      },
      activeActivity: {
        ...session,
        status: blocked ? "blocked" : "running",
        phase,
        elapsedMs,
        travel,
      },
    },
    events,
    summary: {
      completedActions,
      itemsGained,
      itemsConsumed: {},
      experienceGained:
        completedActions === 0 ? {} : { [activity.skillId]: experience },
      bankTrips,
      itemsBanked,
    },
  };
}
