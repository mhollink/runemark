import type { GameContent } from "@runemark/content";
import {
  type ActivitySiteDefinition,
  addInventoryItem,
  availableInventorySlots,
  awardSkillExperience,
  type GameSave,
  type GatheringActivityDefinition,
  type Inventory,
  InventoryCapacityError,
  type ItemDrop,
} from "@runemark/domain";
import { guaranteedDrops, resolveLoot } from "../loot/resolve-loot";
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

  if (session?.status !== "running" || session?.siteId !== site.id) {
    throw new Error("No matching active gathering session");
  }

  if (site.locationId !== state.character.locationId) {
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

  if (
    !Number.isSafeInteger(session.elapsedMs) ||
    session.elapsedMs < 0 ||
    session.elapsedMs >= activity.durationMs
  ) {
    throw new RangeError("Invalid activity progress");
  }

  let cursor = state.lastSimulatedAt;
  let elapsedMs = session.elapsedMs;
  let backpack = state.character.backpack;
  let randomState = state.randomState;
  let completedActions = 0;
  let blocked = false;

  const itemsGained: Record<string, number> = {};
  const events: GameEvent[] = [];
  const guaranteed = guaranteedDrops(activity.rewards, content);

  const block = () => {
    blocked = true;
    elapsedMs = 0;

    events.push({
      type: "ACTIVITY_BLOCKED",
      siteId: site.id,
      activityId: activity.id,
      timestamp: cursor,
      reason: "INVENTORY_FULL",
    });
  };

  while (cursor < until) {
    if (!canGather(backpack, guaranteed, content)) {
      block();
      break;
    }

    const remainingMs = until - cursor;
    const actionRemainingMs = activity.durationMs - elapsedMs;

    if (remainingMs < actionRemainingMs) {
      elapsedMs += remainingMs;
      break;
    }

    cursor += actionRemainingMs;
    elapsedMs = 0;

    // Resolve the action exactly once.
    const loot = resolveLoot(activity.rewards, content, randomState);
    randomState = loot.randomState;
    completedActions++;

    // Keep only the rewards that fit.
    const stored = storeDrops(backpack, loot.drops, content);
    backpack = stored.inventory;

    for (const drop of stored.accepted) {
      const total = (itemsGained[drop.itemId] ?? 0) + drop.quantity;

      if (!Number.isSafeInteger(total)) {
        throw new RangeError("Gathering item quantity overflow");
      }

      itemsGained[drop.itemId] = total;
    }

    // Stop immediately if another action cannot yield
    // any of its guaranteed resources.
    if (!canGather(backpack, guaranteed, content)) {
      block();
      break;
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
      character: {
        ...state.character,
        backpack,
        skills,
      },
      activeActivity: {
        ...session,
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
    },
  };
}
