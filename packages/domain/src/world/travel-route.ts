export interface TravelRouteDefinition {
  readonly id: string;
  readonly fromId: string;
  readonly toId: string;
  readonly durationMs: number;
}

export interface TravelLeg {
  readonly routeId: string;
  readonly fromId: string;
  readonly toId: string;
  readonly durationMs: number;
}
