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
} from "@runemark/domain";
import { guaranteedDrops, resolveLoot } from "../loot/resolve-loot";
import type { GameEvent, SimulationResult } from "../simulation-types";

const BANKING_DURATION_MS = 60_000;

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

  const location = content.locations[site.locationId];
  if (!location || site.locationId !== state.character.locationId) {
    throw new Error(`Site ${site.id} is not available here`);
  }

  if (
    !Number.isSafeInteger(activity.durationMs) ||
    activity.durationMs <= 0 ||
    !Number.isSafeInteger(activity.experiencePerAction) ||
    activity.experiencePerAction <= 0
  ) {
    throw new RangeError(`Invalid gathering activity: ${activity.id}`);
  }

  const phaseDuration =
    session.phase === "working" ? activity.durationMs : BANKING_DURATION_MS;

  if (
    !Number.isSafeInteger(session.elapsedMs) ||
    session.elapsedMs < 0 ||
    session.elapsedMs >= phaseDuration
  ) {
    throw new RangeError("Invalid activity phase progress");
  }

  let cursor = state.lastSimulatedAt;
  let elapsedMs = session.elapsedMs;
  let phase: ActivityPhase = session.phase;
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
  const bankAvailable = location.facilities?.includes("bank") ?? false;

  /**
   * Called when the next gathering action cannot fit.
   *
   * If banking is possible, enter the banking phase.
   * Otherwise, block the selected activity.
   */
  const startBankingOrBlock = () => {
    if (bankAvailable && backpack.slots.length > 0) {
      phase = "banking";
      elapsedMs = 0;
      return;
    }

    blocked = true;
    phase = "working";
    elapsedMs = 0;

    events.push({
      type: "ACTIVITY_BLOCKED",
      siteId: site.id,
      activityId: activity.id,
      timestamp: cursor,
      reason: bankAvailable ? "INVENTORY_FULL" : "BANK_UNAVAILABLE",
    });
  };

  while (cursor < until && !blocked) {
    // A newly started activity may already have a full backpack.
    if (phase === "working" && !canGather(backpack, guaranteed, content)) {
      startBankingOrBlock();

      if (blocked) {
        break;
      }
    }

    const duration =
      phase === "working" ? activity.durationMs : BANKING_DURATION_MS;

    const remaining = until - cursor;
    const required = duration - elapsedMs;
    const advanced = Math.min(remaining, required);

    cursor += advanced;
    elapsedMs += advanced;

    // Preserve partial progress until the next simulation.
    if (elapsedMs < duration) {
      break;
    }

    elapsedMs = 0;

    if (phase === "banking") {
      // The full 60 seconds have elapsed.
      // Deposit the backpack into the global bank.
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
      phase = "working";

      // Prevent an infinite loop if an activity cannot produce
      // its guaranteed rewards even with an empty backpack.
      if (!canGather(backpack, guaranteed, content)) {
        startBankingOrBlock();
      }

      continue;
    }

    // A gathering action has completed.
    const loot = resolveLoot(activity.rewards, content, randomState);

    randomState = loot.randomState;
    completedActions++;

    // Existing behavior: store what fits and discard the rest.
    const stored = storeDrops(backpack, loot.drops, content);
    backpack = stored.inventory;

    for (const drop of stored.accepted) {
      const total = (itemsGained[drop.itemId] ?? 0) + drop.quantity;

      if (!Number.isSafeInteger(total)) {
        throw new RangeError("Gathering item quantity overflow");
      }

      itemsGained[drop.itemId] = total;
    }

    // Enter the banking phase immediately when no more
    // guaranteed resources can fit.
    if (!canGather(backpack, guaranteed, content)) {
      startBankingOrBlock();
    }
  }

  const experience = completedActions * activity.experiencePerAction;

  if (!Number.isSafeInteger(experience)) {
    throw new RangeError("Gathering experience overflow");
  }

  const skills =
    completedActions === 0
      ? state.character.skills
      : awardSkillExperience(
          state.character.skills,
          activity.skillId,
          experience,
        );

  return {
    state: {
      ...state,
      lastSimulatedAt: until,
      randomState,
      bank,
      character: {
        ...state.character,
        backpack,
        skills,
      },
      activeActivity: {
        ...session,
        phase,
        elapsedMs,
        status: blocked ? "blocked" : "running",
      },
    },
    events,
    summary: {
      completedActions,
      itemsGained,
      experienceGained:
        completedActions === 0 ? {} : { [activity.skillId]: experience },
      bankTrips,
      itemsBanked,
    },
  };
}
