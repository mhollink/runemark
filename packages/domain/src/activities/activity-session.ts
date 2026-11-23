export type ActivityPhase = "working" | "banking";

export interface ActivitySession {
  readonly siteId: string;
  readonly phase: ActivityPhase;
  readonly elapsedMs: number;
  readonly status: "running" | "blocked";
}
