import type { GameContent } from "@runemark/content";
import {
  type ActivityPhase,
  type ActivitySiteDefinition,
  awardSkillExperience,
  createInventory,
  depositInventory,
  type GameSave,
  type ItemDrop,
  type ProductionActivityDefinition,
  type TravelLeg,
  type TravelProgress,
} from "@runemark/domain";
import { BANKING_DURATION_MS } from "../logistics/config";
import { findNearestBank, findShortestRoute } from "../navigation/find-route";
import type { GameEvent, SimulationResult } from "../simulation-types";
import {
  hasBankIngredients,
  tryProduce,
  withdrawProductionBatch,
} from "./production-operations";

export function simulateProduction(
  state: GameSave,
  content: GameContent,
  site: ActivitySiteDefinition,
  activity: ProductionActivityDefinition,
  until: number,
): SimulationResult {
  const session = state.activeActivity;

  if (session?.status !== "running" || session.siteId !== site.id) {
    throw new Error("No matching active production session");
  }

  if (
    !Number.isSafeInteger(activity.durationMs) ||
    activity.durationMs <= 0 ||
    !Number.isSafeInteger(activity.experiencePerAction) ||
    activity.experiencePerAction <= 0 ||
    activity.inputs.length === 0 ||
    activity.outputs.length === 0
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

  let completedActions = 0;
  let bankTrips = 0;
  let blocked = false;

  const itemsGained: Record<string, number> = {};
  const itemsConsumed: Record<string, number> = {};
  const itemsBanked: Record<string, number> = {};
  const events: GameEvent[] = [];

  function block(reason: GameEvent["reason"]): void {
    blocked = true;
    elapsedMs = 0;
    phase = "working";
    travel = null;

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

    // Unlike gathering, production may need to visit
    // the bank even when the backpack is empty.
    beginTravel("travel-to-bank", route);
  }

  function recordItems(
    ledger: Record<string, number>,
    items: readonly ItemDrop[],
  ): void {
    for (const { itemId, quantity } of items) {
      const total = (ledger[itemId] ?? 0) + quantity;

      if (!Number.isSafeInteger(total)) {
        throw new RangeError("Production summary overflow");
      }

      ledger[itemId] = total;
    }
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

    if (phase === "banking") {
      const advance = Math.min(until - cursor, BANKING_DURATION_MS - elapsedMs);

      cursor += advance;
      elapsedMs += advance;

      if (elapsedMs < BANKING_DURATION_MS) break;

      elapsedMs = 0;

      if (!content.locations[nodeId]?.facilities?.includes("bank")) {
        throw new Error(`No bank at ${nodeId}`);
      }

      // Deposit existing outputs and unused ingredients.
      bank = depositInventory(bank, backpack);
      recordItems(itemsBanked, backpack.slots);

      const capacity = backpack.capacity;

      if (capacity === null) {
        throw new Error("Production requires a finite backpack");
      }

      backpack = createInventory(capacity);
      bankTrips++;

      if (!hasBankIngredients(bank, activity)) {
        block("INSUFFICIENT_MATERIALS");
        continue;
      }

      const batch = withdrawProductionBatch(bank, capacity, activity, content);

      if (batch.actions === 0) {
        block("INVENTORY_FULL");
        continue;
      }

      const route = findShortestRoute(content, nodeId, site.id);

      if (route === null) {
        block("BANK_UNAVAILABLE");
        continue;
      }

      bank = batch.bank;
      backpack = batch.backpack;

      beginTravel("travel-to-site", route);
      continue;
    }

    // Working phase.
    if (nodeId !== site.id) {
      throw new Error(`Character is not at site ${site.id}`);
    }

    const produced = tryProduce(backpack, activity, content);

    if (produced === null) {
      startBankingOrBlock();
      continue;
    }

    const advance = Math.min(until - cursor, activity.durationMs - elapsedMs);

    cursor += advance;
    elapsedMs += advance;

    if (elapsedMs < activity.durationMs) break;

    // Commit the recipe only after the action finishes.
    elapsedMs = 0;
    backpack = produced;
    completedActions++;

    recordItems(itemsConsumed, activity.inputs);
    recordItems(itemsGained, activity.outputs);

    if (tryProduce(backpack, activity, content) === null) {
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
      itemsConsumed,
      experienceGained:
        completedActions === 0 ? {} : { [activity.skillId]: experience },
      bankTrips,
      itemsBanked,
    },
  };
}
