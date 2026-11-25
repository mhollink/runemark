import type { LocationDefinition } from "./location";
import type { ActivitySiteDefinition } from "./site";
import type { TravelRouteDefinition } from "./travel-route";

export interface RegionDefinition {
  readonly id: string;
  readonly name: string;
}

export interface RegionalContent {
  readonly region: RegionDefinition;
  readonly locations: readonly LocationDefinition[];
  readonly sites: readonly ActivitySiteDefinition[];
  readonly routes: readonly TravelRouteDefinition[];
}
