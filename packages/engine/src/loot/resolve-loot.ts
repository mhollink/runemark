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

    case "conditional": {
      if (!Number.isSafeInteger(node.oneIn) || node.oneIn <= 0) {
        throw new RangeError("Invalid conditional probability");
      }

      const roll = nextRandom(randomState);
      const selected =
        roll.value < 1 / node.oneIn ? node.success : node.failure;

      return resolveLoot(selected, content, roll.randomState, visited);
    }

    case "weighted": {
      const total = node.entries.reduce((sum, entry) => {
        if (!Number.isSafeInteger(entry.weight) || entry.weight <= 0) {
          throw new RangeError("Invalid loot weight");
        }
        return sum + entry.weight;
      }, 0);

      if (!Number.isSafeInteger(total) || total <= 0) {
        throw new RangeError("Invalid total loot weight");
      }

      const roll = nextRandom(randomState);
      const selection = roll.value * total;

      let threshold = 0;

      for (const entry of node.entries) {
        threshold += entry.weight;

        if (selection < threshold) {
          return resolveLoot(entry.reward, content, roll.randomState, visited);
        }
      }

      throw new Error("Failed to select weighted loot");
    }

    case "all": {
      const drops: ItemQuantity[] = [];
      let currentRandomState = randomState;

      for (const reward of node.rewards) {
        const result = resolveLoot(
          reward,
          content,
          currentRandomState,
          visited,
        );

        drops.push(...result.drops);
        currentRandomState = result.randomState;
      }

      return { drops, randomState: currentRandomState };
    }
  }
}

/**
 * Returns only unconditional rewards.
 * Used to determine whether gathering can continue.
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
