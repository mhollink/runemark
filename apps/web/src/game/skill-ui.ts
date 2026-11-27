import Construction from "@mui/icons-material/Construction";
import Favorite from "@mui/icons-material/Favorite";
import FitnessCenter from "@mui/icons-material/FitnessCenter";
import Grass from "@mui/icons-material/Grass";
import Handyman from "@mui/icons-material/Handyman";
import Park from "@mui/icons-material/Park";
import Restaurant from "@mui/icons-material/Restaurant";
import SetMeal from "@mui/icons-material/SetMeal";
import Shield from "@mui/icons-material/Shield";
import SportsMartialArts from "@mui/icons-material/SportsMartialArts";
import StarOutline from "@mui/icons-material/StarBorderOutlined";
import type { SkillCategory } from "@runemark/domain";

export const skillCategories = [
  { id: "gathering", name: "Gathering", color: "success" },
  { id: "production", name: "Artisan", color: "warning" },
  { id: "combat", name: "Combat", color: "error" },
  { id: "support", name: "Support", color: "primary" },
] as const;

const icons: Record<string, typeof Park> = {
  woodcutting: Park,
  mining: Construction,
  fishing: SetMeal,
  foraging: Grass,
  cooking: Restaurant,
  woodworking: Handyman,
  smithing: Construction,
  attack: SportsMartialArts,
  constitution: Favorite,
  defense: Shield,
  strength: FitnessCenter,
};

export function skillIcon(id: string) {
  return icons[id] ?? StarOutline;
}
export function categoryColor(category: SkillCategory) {
  return skillCategories.find(({ id }) => id === category)?.color ?? "primary";
}
