import type { LocationDefinition } from "@runemark/domain";
import { goldvale } from "../region";

export const oakridge = {
  id: "oakridge",
  name: "Oakridge",
  regionId: goldvale.id,
  facilities: ["bank", "sawmill", "workshop"],
} satisfies LocationDefinition;
