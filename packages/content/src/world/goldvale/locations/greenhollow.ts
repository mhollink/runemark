import type { LocationDefinition } from "@runemark/domain";
import { goldvale } from "../region";

export const greenhollow = {
  id: "greenhollow",
  name: "Greenhollow",
  regionId: goldvale.id,
  facilities: ["bank"],
} satisfies LocationDefinition;
