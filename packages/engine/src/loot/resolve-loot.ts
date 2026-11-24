import type { GameContent } from "@runemark/content";
import type { ItemQuantity, LootNode } from "@runemark/domain";
import { nextRandom } from "./random";

export interface LootResolution {
  readonly drops: readonly ItemQuantity[];
  readonly randomState: number;
}

function findTable(
  tableId: string,
  content: GameContent,
  visited: ReadonlySet<string>,
): { node: LootNode; visited: ReadonlySet<string> } {
  const table = content.lootTables[tableId];

  if (!table) {
    throw new Error(`Unknown loot table: ${tableId}`);
  }

  if (visited.has(tableId)) {
    throw new Error(`Circular loot table: ${tableId}`);
  }

  return {
    node: table,
    visited: new Set([...visited, tableId]),
  };
}

export function resolveLoot(
  node: LootNode,
  content: GameContent,
  randomState: number,
  visited: ReadonlySet<string> = new Set(),
): LootResolution {
  switch (node.kind) {
    case "nothing":
      return { drops: [], randomState };

    case "fixed":
      return { drops: [...node.drops], randomState };

    case "table": {
      const table = findTable(node.tableId, content, visited);
      return resolveLoot(table.node, content, randomState, table.visited);
    }

    case "conditional":
      return resolveConditionalLoot(node, content, randomState, visited);
    case "weighted":
      return resolveWeightedLoot(node, content, randomState, visited);
    case "all":
      return resolveGroupedLoot(node, content, randomState, visited);
  }
}

function resolveConditionalLoot(
  node: Extract<LootNode, { kind: "conditional" }>,
  content: GameContent,
  randomState: number,
  visited: ReadonlySet<string>,
): LootResolution {
  if (!Number.isSafeInteger(node.oneIn) || node.oneIn <= 0)
    throw new RangeError("Invalid conditional probability");
  const roll = nextRandom(randomState);
  const selected = roll.value < 1 / node.oneIn ? node.success : node.failure;
  return resolveLoot(selected, content, roll.randomState, visited);
}

type WeightedLoot = Extract<LootNode, { kind: "weighted" }>;

function totalLootWeight(node: WeightedLoot): number {
  const total = node.entries.reduce((sum, entry) => {
    if (!Number.isSafeInteger(entry.weight) || entry.weight <= 0)
      throw new RangeError("Invalid loot weight");
    return sum + entry.weight;
  }, 0);
  if (!Number.isSafeInteger(total) || total <= 0)
    throw new RangeError("Invalid total loot weight");
  return total;
}

function selectWeightedReward(node: WeightedLoot, selection: number): LootNode {
  let threshold = 0;
  for (const entry of node.entries) {
    threshold += entry.weight;
    if (selection < threshold) return entry.reward;
  }
  throw new Error("Failed to select weighted loot");
}

function resolveWeightedLoot(
  node: WeightedLoot,
  content: GameContent,
  randomState: number,
  visited: ReadonlySet<string>,
): LootResolution {
  const total = totalLootWeight(node);
  const roll = nextRandom(randomState);
  return resolveLoot(
    selectWeightedReward(node, roll.value * total),
    content,
    roll.randomState,
    visited,
  );
}

function resolveGroupedLoot(
  node: Extract<LootNode, { kind: "all" }>,
  content: GameContent,
  randomState: number,
  visited: ReadonlySet<string>,
): LootResolution {
  const drops: ItemQuantity[] = [];
  let currentRandomState = randomState;
  for (const reward of node.rewards) {
    const result = resolveLoot(reward, content, currentRandomState, visited);
    drops.push(...result.drops);
    currentRandomState = result.randomState;
  }
  return { drops, randomState: currentRandomState };
}

/**
 * Returns unconditional fixed rewards for capacity checks.
 * Does not infer guarantees across conditional or weighted alternatives.
 */
export function guaranteedDrops(
  node: LootNode,
  content: GameContent,
  visited: ReadonlySet<string> = new Set(),
): readonly ItemQuantity[] {
  switch (node.kind) {
    case "fixed":
      return node.drops;

    case "all":
      return node.rewards.flatMap((reward) =>
        guaranteedDrops(reward, content, visited),
      );

    case "table": {
      const table = findTable(node.tableId, content, visited);
      return guaranteedDrops(table.node, content, table.visited);
    }

    default:
      return [];
  }
}
