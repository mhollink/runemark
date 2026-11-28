import {
  type LootNode,
  MAX_SKILL_LEVEL,
  MIN_SKILL_LEVEL,
} from "@runemark/domain";
import { describe, expect, it } from "vitest";
import { gameContent } from "./index";

/**
 * Verify that registry keys match the IDs of their definitions.
 */
function validateRegistryIds(
  name: string,
  registry: Readonly<Record<string, { readonly id: string }>>,
): void {
  for (const [key, definition] of Object.entries(registry)) {
    expect(definition.id, `${name}: key ${key}`).toBe(key);
  }
}

/**
 * Recursively validate loot nodes, including references to other
 * loot tables. Track the current reference path to detect cycles.
 */
function validateLoot(
  node: LootNode,
  path: string,
  activeTables: ReadonlySet<string> = new Set(),
): void {
  switch (node.kind) {
    case "nothing":
      return;

    case "currency":
      expect(node.amount, `${path}: invalid currency value`).toBeGreaterThan(0);
      return;

    case "fixed":
      expect(node.drops.length, `${path}: empty fixed drops`).toBeGreaterThan(
        0,
      );

      for (const drop of node.drops) {
        expect(
          gameContent.items[drop.itemId],
          `${path}: unknown item ${drop.itemId}`,
        ).toBeDefined();

        expect(
          Number.isSafeInteger(drop.quantity),
          `${path}: invalid quantity for ${drop.itemId}`,
        ).toBe(true);

        expect(drop.quantity, `${path}: non-positive quantity`).toBeGreaterThan(
          0,
        );
      }
      return;

    case "table": {
      const table = gameContent.lootTables[node.tableId];

      expect(
        table,
        `${path}: unknown loot table ${node.tableId}`,
      ).toBeDefined();

      expect(
        activeTables.has(node.tableId),
        `${path}: circular loot table reference to ${node.tableId}`,
      ).toBe(false);

      if (table !== undefined) {
        validateLoot(
          table,
          `${path} -> ${node.tableId}`,
          new Set([...activeTables, node.tableId]),
        );
      }
      return;
    }

    case "conditional":
      expect(
        Number.isSafeInteger(node.oneIn),
        `${path}: oneIn must be an integer`,
      ).toBe(true);

      expect(node.oneIn, `${path}: invalid oneIn`).toBeGreaterThan(0);

      validateLoot(node.success, `${path}.success`, activeTables);
      validateLoot(node.failure, `${path}.failure`, activeTables);
      return;

    case "weighted": {
      expect(
        node.entries.length,
        `${path}: empty weighted table`,
      ).toBeGreaterThan(0);

      let totalWeight = 0;

      for (const [index, entry] of node.entries.entries()) {
        expect(
          Number.isSafeInteger(entry.weight),
          `${path}: invalid weight at entry ${index}`,
        ).toBe(true);

        expect(entry.weight, `${path}: non-positive weight`).toBeGreaterThan(0);

        totalWeight += entry.weight;

        validateLoot(entry.reward, `${path}.entries[${index}]`, activeTables);
      }

      expect(
        Number.isSafeInteger(totalWeight),
        `${path}: total weight exceeds safe integer range`,
      ).toBe(true);
      return;
    }

    case "all":
      expect(
        node.rewards.length,
        `${path}: empty reward group`,
      ).toBeGreaterThan(0);

      for (const [index, reward] of node.rewards.entries()) {
        validateLoot(reward, `${path}.rewards[${index}]`, activeTables);
      }
      return;

    default: {
      const unreachable: never = node;
      throw new Error(`Unknown loot node: ${JSON.stringify(unreachable)}`);
    }
  }
}

/** Find all nodes reachable from any bank using bidirectional routes. */
function findBankReachableNodes(): ReadonlySet<string> {
  const reachable = new Set(
    Object.values(gameContent.locations)
      .filter((location) => location.facilities?.includes("bank"))
      .map((location) => location.id),
  );
  const routes = Object.values(gameContent.routes);

  let previousSize: number;
  do {
    previousSize = reachable.size;
    for (const { fromId, toId } of routes) {
      if (reachable.has(fromId)) reachable.add(toId);
      if (reachable.has(toId)) reachable.add(fromId);
    }
  } while (reachable.size !== previousSize);

  return reachable;
}

/** Collect items from all possible loot outcomes, not just fixed drops. */
function collectLootItemIds(
  node: LootNode,
  itemIds: Set<string>,
  activeTables: ReadonlySet<string> = new Set(),
): void {
  switch (node.kind) {
    case "nothing":
      return;
    case "fixed":
      for (const { itemId } of node.drops) itemIds.add(itemId);
      return;
    case "table": {
      const table = gameContent.lootTables[node.tableId];
      if (!table || activeTables.has(node.tableId)) {
        throw new Error(`Invalid loot table reference: ${node.tableId}`);
      }
      collectLootItemIds(
        table,
        itemIds,
        new Set([...activeTables, node.tableId]),
      );
      return;
    }
    case "conditional":
      collectLootItemIds(node.success, itemIds, activeTables);
      if (node.oneIn > 1) {
        collectLootItemIds(node.failure, itemIds, activeTables);
      }
      return;
    case "weighted":
      for (const { reward } of node.entries) {
        collectLootItemIds(reward, itemIds, activeTables);
      }
      return;
    case "all":
      for (const reward of node.rewards) {
        collectLootItemIds(reward, itemIds, activeTables);
      }
      return;
  }
}

/**
 * Start with gathering and combat rewards, then unlock recipes whose inputs
 * can already be obtained. Unreferenced loot tables and circular recipes
 * cannot act as independent acquisition sources.
 */
function findObtainableItems(): ReadonlySet<string> {
  const obtainable = new Set<string>();
  const activities = Object.values(gameContent.activities);

  for (const activity of activities) {
    if (activity.kind === "gathering") {
      collectLootItemIds(activity.rewards, obtainable);
    } else if (activity.kind === "combat") {
      const monster = gameContent.monsters[activity.monsterId];
      if (!monster) throw new Error(`Unknown monster: ${activity.monsterId}`);
      collectLootItemIds(monster.loot, obtainable);
    }
  }

  const recipes = activities.filter(
    (activity) => activity.kind === "production",
  );
  let previousSize: number;
  do {
    previousSize = obtainable.size;
    for (const recipe of recipes) {
      if (recipe.inputs.every(({ itemId }) => obtainable.has(itemId))) {
        for (const { itemId } of recipe.outputs) obtainable.add(itemId);
      }
    }
  } while (obtainable.size !== previousSize);

  return obtainable;
}

describe("game content", () => {
  describe("registries", () => {
    it("all definitions have matching registry keys", () => {
      validateRegistryIds("regions", gameContent.regions);
      validateRegistryIds("locations", gameContent.locations);
      validateRegistryIds("sites", gameContent.sites);
      validateRegistryIds("items", gameContent.items);
      validateRegistryIds("activities", gameContent.activities);
      validateRegistryIds("monsters", gameContent.monsters);
      validateRegistryIds("loot tables", gameContent.lootTables);
      validateRegistryIds("routes", gameContent.routes);
      validateRegistryIds("skills", gameContent.skills);
    });

    it("all named definitions have non-empty names", () => {
      const named = [
        ...Object.values(gameContent.regions),
        ...Object.values(gameContent.locations),
        ...Object.values(gameContent.items),
        ...Object.values(gameContent.activities),
        ...Object.values(gameContent.monsters),
        ...Object.values(gameContent.sites),
        ...Object.values(gameContent.skills),
      ];

      for (const definition of named) {
        expect(definition.name.trim(), definition.id).not.toBe("");
      }
    });
  });

  describe("world", () => {
    it("all world nodes have globally unique IDs", () => {
      const nodeIds = [
        ...Object.keys(gameContent.locations),
        ...Object.keys(gameContent.sites),
      ];
      expect(new Set(nodeIds).size).toBe(nodeIds.length);
    });

    it("all locations are inside a defined region", () => {
      for (const location of Object.values(gameContent.locations)) {
        expect(
          gameContent.regions[location.regionId],
          `${location.id}: unknown region ${location.regionId}`,
        ).toBeDefined();
      }
    });

    it("all sites have defined activities and regions", () => {
      for (const site of Object.values(gameContent.sites)) {
        expect(
          gameContent.regions[site.regionId],
          `${site.id}: unknown region ${site.regionId}`,
        ).toBeDefined();
        expect(site.activityIds.length, site.id).toBeGreaterThan(0);
        expect(new Set(site.activityIds).size, site.id).toBe(
          site.activityIds.length,
        );
        for (const activityId of site.activityIds) {
          expect(
            gameContent.activities[activityId],
            `${site.id}: unknown activity ${activityId}`,
          ).toBeDefined();
        }
      }
    });

    it("all travel routes connect valid and distinct nodes", () => {
      const nodes = new Set([
        ...Object.keys(gameContent.locations),
        ...Object.keys(gameContent.sites),
      ]);

      for (const route of Object.values(gameContent.routes)) {
        expect(
          nodes.has(route.fromId),
          `${route.id}: unknown origin '${route.fromId}'`,
        ).toBe(true);
        expect(
          nodes.has(route.toId),
          `${route.id}: unknown destination '${route.toId}'`,
        ).toBe(true);
        expect(route.fromId, route.id).not.toBe(route.toId);

        expect(Number.isSafeInteger(route.durationMs), route.id).toBe(true);

        expect(route.durationMs, route.id).toBeGreaterThan(0);
      }
    });

    it("travel routes have unique bidirectional connections", () => {
      const connections = new Set<string>();

      for (const route of Object.values(gameContent.routes)) {
        const connection = JSON.stringify([route.fromId, route.toId].sort());
        expect(
          connections.has(connection),
          `Duplicate route: ${route.id}`,
        ).toBe(false);
        connections.add(connection);
      }
    });

    it("all activity sites can reach a bank", () => {
      const reachable = findBankReachableNodes();
      const unreachable = Object.keys(gameContent.sites).filter(
        (siteId) => !reachable.has(siteId),
      );

      expect(unreachable).toEqual([]);
    });
  });

  describe("activities", () => {
    it("all gathering and combat activities are available at a site", () => {
      const siteActivities = new Set(
        Object.values(gameContent.sites).flatMap((site) => site.activityIds),
      );
      const missing = Object.values(gameContent.activities)
        .filter(
          (activity) =>
            activity.kind !== "production" && !siteActivities.has(activity.id),
        )
        .map((activity) => activity.id);

      expect(missing).toEqual([]);
    });

    it("all production activities have a compatible settlement", () => {
      const locations = Object.values(gameContent.locations);

      for (const activity of Object.values(gameContent.activities)) {
        if (activity.kind !== "production") continue;

        expect(activity.requiredFacility.length, activity.id).toBeGreaterThan(
          0,
        );
        expect(
          locations.some((location) =>
            activity.requiredFacility.every((facility) =>
              location.facilities?.includes(facility),
            ),
          ),
          `${activity.id}: no location with all required facilities`,
        ).toBe(true);
      }
    });

    it("all activity skill requirements are valid", () => {
      for (const activity of Object.values(gameContent.activities)) {
        const seen = new Set<string>();
        for (const { skillId, level } of activity.requirements ?? []) {
          const path = `${activity.id}: ${skillId}`;
          expect(gameContent.skills[skillId], path).toBeDefined();
          expect(Number.isSafeInteger(level), path).toBe(true);
          expect(level, path).toBeGreaterThanOrEqual(MIN_SKILL_LEVEL);
          expect(level, path).toBeLessThanOrEqual(MAX_SKILL_LEVEL);
          expect(seen.has(skillId), `${path}: duplicate requirement`).toBe(
            false,
          );
          seen.add(skillId);
        }
      }
    });

    it("all gathering rewards are valid", () => {
      for (const activity of Object.values(gameContent.activities)) {
        if (activity.kind === "gathering") {
          validateLoot(activity.rewards, `activity:${activity.id}`);
        }
      }
    });

    it("all production inputs/outputs are valid", () => {
      for (const activity of Object.values(gameContent.activities)) {
        if (activity.kind === "production") {
          validateLoot(
            { drops: activity.inputs, kind: "fixed" },
            `activity:${activity.id}.inputs`,
          );
          validateLoot(
            { drops: activity.outputs, kind: "fixed" },
            `activity:${activity.id}.outputs`,
          );
        }
      }
    });

    it("production recipes have unique and distinct inputs and outputs", () => {
      for (const activity of Object.values(gameContent.activities)) {
        if (activity.kind !== "production") {
          continue;
        }

        const inputs = activity.inputs.map(({ itemId }) => itemId);
        const outputs = activity.outputs.map(({ itemId }) => itemId);

        expect(new Set(inputs).size, activity.id).toBe(inputs.length);
        expect(new Set(outputs).size, activity.id).toBe(outputs.length);

        for (const itemId of inputs) {
          expect(outputs, activity.id).not.toContain(itemId);
        }
      }
    });

    it("all non-combat activities have valid progression properties", () => {
      for (const activity of Object.values(gameContent.activities)) {
        if (activity.kind === "combat") {
          continue;
        }

        expect(Number.isSafeInteger(activity.durationMs), activity.id).toBe(
          true,
        );

        expect(activity.durationMs, activity.id).toBeGreaterThan(0);

        expect(
          Number.isSafeInteger(activity.experiencePerAction),
          activity.id,
        ).toBe(true);

        expect(activity.experiencePerAction, activity.id).toBeGreaterThan(0);

        expect(gameContent.skills[activity.skillId], activity.id).toBeDefined();
      }
    });

    it("all combat activities are valid", () => {
      for (const activity of Object.values(gameContent.activities)) {
        if (activity.kind === "combat") {
          expect(gameContent.monsters[activity.monsterId]).toBeDefined();
        }
      }
    });
  });

  describe("items", () => {
    it("all registered items have an acquisition source", () => {
      const obtainable = findObtainableItems();
      const missing = Object.keys(gameContent.items).filter(
        (itemId) => !obtainable.has(itemId),
      );

      expect(missing).toEqual([]);
    });

    it("all production ingredients can be obtained", () => {
      const obtainable = findObtainableItems();
      const missing = Object.values(gameContent.activities).flatMap(
        (activity) =>
          activity.kind === "production"
            ? activity.inputs
                .filter(({ itemId }) => !obtainable.has(itemId))
                .map(({ itemId }) => `${activity.id}: ${itemId}`)
            : [],
      );

      expect(missing).toEqual([]);
    });
  });

  describe("monsters", () => {
    it("all monsters are referenced by a combat activity", () => {
      const referenced = new Set(
        Object.values(gameContent.activities).flatMap((activity) =>
          activity.kind === "combat" ? [activity.monsterId] : [],
        ),
      );
      const missing = Object.keys(gameContent.monsters).filter(
        (monsterId) => !referenced.has(monsterId),
      );

      expect(missing).toEqual([]);
    });

    it("all monsters have finite defense ratings for every attack type", () => {
      for (const { id, combat } of Object.values(gameContent.monsters)) {
        for (const attackType of ["melee", "ranged", "magic"] as const) {
          expect(
            Number.isFinite(combat.defense?.[attackType]),
            `${id}: invalid ${attackType} defense rating`,
          ).toBe(true);
        }
      }
    });

    it("all monster loot is valid", () => {
      for (const monster of Object.values(gameContent.monsters)) {
        validateLoot(monster.loot, `monster:${monster.id}`);
      }
    });

    it("all monsters have valid combat statistics", () => {
      for (const monster of Object.values(gameContent.monsters)) {
        const { combat } = monster;

        for (const value of [
          combat.maxHitpoints,
          combat.maxHit,
          combat.attackIntervalMs,
        ]) {
          expect(Number.isSafeInteger(value), monster.id).toBe(true);
          expect(value, monster.id).toBeGreaterThan(0);
        }

        expect(Number.isFinite(combat.accuracy)).toBe(true);
        expect(combat.accuracy).toBeGreaterThanOrEqual(0);
        expect(combat.accuracy).toBeLessThanOrEqual(1);

        expect(["melee", "ranged", "magic"]).toContain(combat.attackType);
      }
    });
  });

  describe("loot tables", () => {
    it("all shared loot tables are valid", () => {
      for (const table of Object.values(gameContent.lootTables)) {
        validateLoot(table, `loot-table:${table.id}`, new Set([table.id]));
      }
    });
  });
});
