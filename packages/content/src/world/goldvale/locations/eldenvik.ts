import type { LocationDefinition } from "@runemark/domain";
import { goldvale } from "../region";

export const eldenvik = {
  id: "eldenvik",
  name: "Eldenvik",
  regionId: goldvale.id,
  facilities: ["bank"],
} satisfies LocationDefinition;
