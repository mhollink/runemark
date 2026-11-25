import type { RegionalContent } from "@runemark/domain";
import { goldvaleRegion } from "./goldvale";

const world: readonly RegionalContent[] = [goldvaleRegion];

export const regions = world.map((content) => content.region);
export const locations = world.flatMap((content) => content.locations);
export const sites = world.flatMap((content) => content.sites);
export const routes = world.flatMap((content) => content.routes);
