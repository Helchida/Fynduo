import { ICategorieRevenu } from "@/types";


export const DEFAULT_CATEGORIES_REVENUS: ICategorieRevenu[] = [
  {
    id: "cat_salaire",
    label: "Salaire",
    icon: "💼",
    isDefault: false,
  },
  {
    id: "cat_apl",
    label: "APL",
    icon: "🏠",
    isDefault: false,
  },
  {
    id: "cat_prime_activite",
    label: "Prime d'activité",
    icon: "💰",
    isDefault: false,
  },
  {
    id: "cat_allocation_chomage",
    label: "Allocation chômage",
    icon: "🎯",
    isDefault: false,
  },
  {
    id: "cat_pension",
    label: "Pension / Retraite",
    icon: "👴",
    isDefault: false,
  },
  {
    id: "cat_prime",
    label: "Prime",
    icon: "⭐",
    isDefault: false,
  },
  {
    id: "cat_investissement",
    label: "Dividendes / Intérêts",
    icon: "📈",
    isDefault: false,
  },
  {
    id: "cat_remboursement_revenu",
    label: "Remboursement",
    icon: "↩️",
    isDefault: false,
  },
  {
    id: "cat_don",
    label: "Don / Cadeau",
    icon: "🎁",
    isDefault: false,
  },
  {
    id: "cat_autre",
    label: "Autre",
    icon: "💵",
    isDefault: true,
  },
];