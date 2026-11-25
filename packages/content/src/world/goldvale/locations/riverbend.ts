import type { LocationDefinition } from "@runemark/domain";
import { goldvale } from "../region";

export const riverbend = {
  id: "riverbend",
  name: "Riverbend",
  regionId: goldvale.id,
  facilities: ["bank", "forge"],
} satisfies LocationDefinition;
