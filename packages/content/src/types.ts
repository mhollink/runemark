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

export interface GameContent {
  readonly version: string;

  readonly items: Readonly<Record<string, ItemDefinition>>;
  readonly activities: Readonly<Record<string, ActivityDefinition>>;
  readonly monsters: Readonly<Record<string, MonsterDefinition>>;
  readonly locations: Readonly<Record<string, LocationDefinition>>;
  readonly sites: Readonly<Record<string, ActivitySiteDefinition>>;
  readonly regions: Readonly<Record<string, RegionDefinition>>;
  readonly lootTables: Readonly<Record<string, LootTableDefinition>>;
  readonly routes: Readonly<Record<string, TravelRouteDefinition>>;
}
