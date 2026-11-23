export interface ActivitySession {
  readonly siteId: string;
  readonly elapsedMs: number;
  readonly status: "running" | "blocked";
}
