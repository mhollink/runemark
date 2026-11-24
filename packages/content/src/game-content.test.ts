import type { LootNode } from "@runemark/domain";
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
    });

    it("all named definitions have non-empty names", () => {
      const named = [
        ...Object.values(gameContent.regions),
        ...Object.values(gameContent.locations),
        ...Object.values(gameContent.items),
        ...Object.values(gameContent.activities),
        ...Object.values(gameContent.monsters),
      ];

      for (const definition of named) {
        expect(definition.name.trim(), definition.id).not.toBe("");
      }
    });
  });

  describe("world", () => {
    it("all locations are inside a defined region", () => {
      for (const location of Object.values(gameContent.locations)) {
        expect(
          gameContent.regions[location.regionId],
          `${location.id}: unknown region ${location.regionId}`,
        ).toBeDefined();
      }
    });

    it("all sites have defined activities and locations", () => {
      for (const site of Object.values(gameContent.sites)) {
        expect(
          gameContent.locations[site.locationId],
          `${site.id}: unknown location ${site.locationId}`,
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
        expect(nodes.has(route.fromId), route.id).toBe(true);
        expect(nodes.has(route.toId), route.id).toBe(true);
        expect(route.fromId, route.id).not.toBe(route.toId);

        expect(Number.isSafeInteger(route.durationMs), route.id).toBe(true);

        expect(route.durationMs, route.id).toBeGreaterThan(0);
      }
    });
  });

  describe("activities", () => {
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

  describe("monsters", () => {
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
