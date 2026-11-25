export type LocationFacility =
  | "bank"
  | "hearth"
  | "forge"
  | "sawmill"
  | "mill"
  | "workshop"
  | "tannery"
  | "loom";

export interface LocationDefinition {
  readonly id: string;
  readonly name: string;
  readonly regionId: string;
  readonly facilities?: readonly LocationFacility[];
}
