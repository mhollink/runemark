import type { WorldNodeDefinition } from "./node";

export interface ActivitySiteDefinition extends WorldNodeDefinition {
  readonly activityIds: readonly string[];
}
