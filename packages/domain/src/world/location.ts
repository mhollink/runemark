export type LocationFacility = "bank";

export interface LocationDefinition {
  readonly id: string;
  readonly name: string;
  readonly regionId: string;
  readonly facilities?: readonly LocationFacility[];
}
