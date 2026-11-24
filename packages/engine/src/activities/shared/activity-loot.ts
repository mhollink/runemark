import type { LootNode } from "@runemark/domain";
import { resolveLoot } from "../../loot/resolve-loot";
import { storeLoot } from "../../loot/store-loot";
import type { ActivityRuntime } from "./activity-runtime";
import { recordItems } from "./activity-summary";

export function collectLoot(runtime: ActivityRuntime, rewards: LootNode): void {
  const loot = resolveLoot(rewards, runtime.content, runtime.randomState);
  const stored = storeLoot(
    runtime.character.backpack,
    runtime.content,
    loot.drops,
  );
  runtime.randomState = loot.randomState;
  runtime.character = { ...runtime.character, backpack: stored.inventory };
  recordItems(runtime.summary.itemsGained, stored.accepted);
}
