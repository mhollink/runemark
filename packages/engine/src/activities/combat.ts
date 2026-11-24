import type { GameContent } from "@runemark/content";
import {
  type ActivityPhase,
  type ActivitySiteDefinition,
  addInventoryItem,
  awardSkillExperience,
  type CombatActivityDefinition,
  createInventory,
  depositInventory,
  type GameSave,
  type Inventory,
  InventoryCapacityError,
  type ItemQuantity,
  type TravelLeg,
  type TravelProgress,
} from "@runemark/domain";
import { advanceEncounter, createEncounter } from "../combat/encounter";
import { getPlayerCombatStats } from "../combat/player-stats";
import { BANKING_DURATION_MS } from "../logistics/config";
import { guaranteedDrops, resolveLoot } from "../loot/resolve-loot";
import { findNearestBank, findShortestRoute } from "../navigation/find-route";
import type { GameEvent, SimulationResult } from "../simulation-types";

export function simulateCombat(
  state: GameSave,
  content: GameContent,
  site: ActivitySiteDefinition,
  activity: CombatActivityDefinition,
  until: number,
): SimulationResult {
  const session = state.activeActivity;

  if (
    session?.status !== "running" ||
    session.siteId !== site.id ||
    session.activityId !== activity.id
  ) {
    throw new Error("No matching active combat session");
  }

  const monster = content.monsters[activity.monsterId];

  if (!monster) {
    throw new Error(`Unknown monster: ${activity.monsterId}`);
  }

  const player = getPlayerCombatStats(state.character);

  let cursor = state.lastSimulatedAt;
  let phase: ActivityPhase = session.phase;
  let elapsedMs = session.elapsedMs;
  let travel: TravelProgress | null = session.travel;

  let nodeId = state.character.nodeId;
  let locationId = state.character.locationId;
  let backpack = state.character.backpack;
  let bank = state.bank;
  let randomState = state.randomState;
  let currentHitpoints = state.character.currentHitpoints;

  let combat = session.combat;

  let completedActions = 0;
  let bankTrips = 0;
  let blocked = false;

  const itemsGained: Record<string, number> = {};
  const itemsBanked: Record<string, number> = {};
  const events: GameEvent[] = [];

  const guaranteed = guaranteedDrops(monster.loot, content);

  function recordItems(
    ledger: Record<string, number>,
    items: readonly ItemQuantity[],
  ): void {
    for (const { itemId, quantity } of items) {
      const total = (ledger[itemId] ?? 0) + quantity;

      if (!Number.isSafeInteger(total)) {
        throw new RangeError("Combat summary overflow");
      }

      ledger[itemId] = total;
    }
  }

  function addDrop(inventory: Inventory, drop: ItemQuantity): Inventory {
    const item = content.items[drop.itemId];

    if (!item) {
      throw new Error(`Unknown loot item: ${drop.itemId}`);
    }

    return addInventoryItem(inventory, item, drop.quantity);
  }

  function canStoreLoot(): boolean {
    try {
      let inventory = backpack;

      for (const drop of guaranteed) {
        inventory = addDrop(inventory, drop);
      }

      return true;
    } catch (error) {
      if (error instanceof InventoryCapacityError) {
        return false;
      }

      throw error;
    }
  }

  function block(reason: GameEvent["reason"]): void {
    blocked = true;
    elapsedMs = 0;
    phase = "working";
    travel = null;
    combat = undefined;

    events.push({
      type: "ACTIVITY_BLOCKED",
      siteId: site.id,
      activityId: activity.id,
      timestamp: cursor,
      reason,
    });
  }

  function beginTravel(
    destination: "travel-to-bank" | "travel-to-site",
    legs: readonly TravelLeg[],
  ): void {
    elapsedMs = 0;
    combat = undefined;

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

    if (route === null) {
      block("BANK_UNAVAILABLE");
      return;
    }

    if (backpack.slots.length === 0) {
      block("INVENTORY_FULL");
      return;
    }

    beginTravel("travel-to-bank", route);
  }

  while (cursor < until && !blocked) {
    // Travel
    if (phase === "travel-to-bank" || phase === "travel-to-site") {
      const leg = travel?.legs[travel.index];

      if (!leg || leg.fromId !== nodeId) {
        throw new Error("Invalid travel progress");
      }

      const advance = Math.min(until - cursor, leg.durationMs - elapsedMs);

      cursor += advance;
      elapsedMs += advance;

      if (elapsedMs < leg.durationMs) break;

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
        travel = {
          ...travel,
          index: travel.index + 1,
        };
      } else {
        travel = null;
        phase = phase === "travel-to-bank" ? "banking" : "working";
      }

      continue;
    }

    // Banking
    if (phase === "banking") {
      const advance = Math.min(until - cursor, BANKING_DURATION_MS - elapsedMs);

      cursor += advance;
      elapsedMs += advance;

      if (elapsedMs < BANKING_DURATION_MS) break;

      if (!content.locations[nodeId]?.facilities?.includes("bank")) {
        throw new Error(`No bank at ${nodeId}`);
      }

      bank = depositInventory(bank, backpack);
      recordItems(itemsBanked, backpack.slots);

      backpack = createInventory(backpack.capacity);
      currentHitpoints = player.maxHitpoints;
      bankTrips++;

      const route = findShortestRoute(content, nodeId, site.id);

      if (route === null) {
        block("BANK_UNAVAILABLE");
        continue;
      }

      beginTravel("travel-to-site", route);
      continue;
    }

    // Combat
    if (nodeId !== site.id) {
      throw new Error(`Character is not at site ${site.id}`);
    }

    if (!canStoreLoot()) {
      startBankingOrBlock();
      continue;
    }

    if (currentHitpoints <= 0) {
      block("PLAYER_DEFEATED");
      continue;
    }

    combat ??= createEncounter(monster.combat);

    const encounter = advanceEncounter(
      {
        progress: combat,
        playerHitpoints: currentHitpoints,
        randomState,
      },
      player,
      monster.combat,
      until - cursor,
    );

    cursor += encounter.consumedMs;
    currentHitpoints = encounter.playerHitpoints;
    randomState = encounter.randomState;
    combat = encounter.progress;

    if (encounter.outcome === "player-killed") {
      block("PLAYER_DEFEATED");
      continue;
    }

    if (encounter.outcome === "ongoing") {
      break;
    }

    // Monster killed
    completedActions++;

    const loot = resolveLoot(monster.loot, content, randomState);

    randomState = loot.randomState;

    for (const drop of loot.drops) {
      try {
        backpack = addDrop(backpack, drop);
        recordItems(itemsGained, [drop]);
      } catch (error) {
        if (error instanceof InventoryCapacityError) {
          continue;
        }

        throw error;
      }
    }

    combat = undefined;

    if (!canStoreLoot()) {
      startBankingOrBlock();
    }
  }

  // Provisional experience balancing.
  const attackExperience = completedActions * monster.combat.maxHitpoints * 2;

  const constitutionExperience = completedActions * monster.combat.maxHitpoints;

  let skills = state.character.skills;

  if (completedActions > 0) {
    skills = awardSkillExperience(skills, "attack", attackExperience);

    skills = awardSkillExperience(
      skills,
      "constitution",
      constitutionExperience,
    );
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
        currentHitpoints,
        skills,
      },
      activeActivity: {
        ...session,
        status: blocked ? "blocked" : "running",
        phase,
        elapsedMs,
        travel,
        combat,
      },
    },
    events,
    summary: {
      completedActions,
      itemsGained,
      itemsConsumed: {},
      experienceGained:
        completedActions === 0
          ? {}
          : {
              attack: attackExperience,
              constitution: constitutionExperience,
            },
      bankTrips,
      itemsBanked,
    },
  };
}
