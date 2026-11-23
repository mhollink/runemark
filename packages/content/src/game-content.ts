import type {
  ActivityDefinition,
  ActivitySiteDefinition,
  ItemDefinition,
  LocationDefinition,
  LootTableDefinition,
  MonsterDefinition,
  RegionDefinition,
  TravelRouteDefinition,
} from "@runemark/domain";
import { activities } from "./activities";
import { lootTables } from "./common/loot";
import { items } from "./items";
import { monsters } from "./monsters";
import type { GameContent } from "./types";
import { locations, regions, routes, sites } from "./world";

export const gameContent = buildGameContent({
  version: "0.1.0",
  items,
  lootTables,
  monsters,
  regions,
  locations,
  activities,
  sites,
  routes,
});

function indexById<T extends { readonly id: string }>(
  definitions: readonly T[],
): Readonly<Record<string, T>> {
  const result: Record<string, T> = Object.create(null);

  for (const definition of definitions) {
    if (Object.hasOwn(result, definition.id)) {
      throw new Error(`Duplicate content ID: ${definition.id}`);
    }

    result[definition.id] = definition;
  }

  return result;
}

interface GameContentSources {
  readonly version: string;
  readonly items: readonly ItemDefinition[];
  readonly lootTables: readonly LootTableDefinition[];
  readonly monsters: readonly MonsterDefinition[];
  readonly activities: readonly ActivityDefinition[];
  readonly regions: readonly RegionDefinition[];
  readonly locations: readonly LocationDefinition[];
  readonly sites: readonly ActivitySiteDefinition[];
  readonly routes: readonly TravelRouteDefinition[];
}

function buildGameContent(sources: GameContentSources): GameContent {
  return {
    version: sources.version,
    items: indexById(sources.items),
    lootTables: indexById(sources.lootTables),
    monsters: indexById(sources.monsters),
    regions: indexById(sources.regions),
    locations: indexById(sources.locations),
    activities: indexById(sources.activities),
    sites: indexById(sources.sites),
    routes: indexById(sources.routes),
  };
}
