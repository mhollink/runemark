import type { LocationDefinition } from "@runemark/domain";
import { goldvale } from "../region";

export const sunmead = {
  id: "sunmead",
  name: "Sunmead",
  regionId: goldvale.id,
  facilities: ["bank", "mill", "loom", "tannery"],
} satisfies LocationDefinition;
