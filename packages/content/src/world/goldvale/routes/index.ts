import type { TravelRouteDefinition } from "@runemark/domain";
import { eldenvikRoutes } from "./eldenvik";
import { greenhollowRoutes } from "./greenhollow";
import { oakridgeRoutes } from "./oakridge";
import { riverbendRoutes } from "./riverbend";
import { sunmeadRoutes } from "./sunmead";

export const routes = [
  ...eldenvikRoutes,
  ...greenhollowRoutes,
  ...oakridgeRoutes,
  ...riverbendRoutes,
  ...sunmeadRoutes,
] satisfies TravelRouteDefinition[];
