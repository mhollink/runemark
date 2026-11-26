import type { WorldNodeDefinition } from "./node";

export type LocationFacility =
  | "bank"
  | "hearth"
  | "forge"
  | "sawmill"
  | "mill"
  | "workshop"
  | "tannery"
  | "loom";

export interface LocationDefinition extends WorldNodeDefinition {
  readonly facilities?: readonly LocationFacility[];
}
