import type { RegionalContent } from "@runemark/domain";
import { locations } from "./locations";
import { goldvale } from "./region";
import { routes } from "./routes";
import { sites } from "./sites";

export const goldvaleRegion = {
  region: goldvale,
  locations,
  sites,
  routes,
} satisfies RegionalContent;
