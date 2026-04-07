// ─────────────────────────────────────────────
//  theme.ts — Design tokens
//  Source de vérité pour tous les styles de l'app
// ─────────────────────────────────────────────

// ── Couleurs ──────────────────────────────────
export const colors = {
  // Fonds
  background: "#F8F9FA",       // fond principal (EpargneScreen — référence)
  backgroundAlt: "#f4f7f9",    // fond alternatif léger (HomeScreen)
  surface: "#FFFFFF",          // cards, modals, inputs

  // Texte
  textPrimary: "#2c3e50",      // titres, labels importants
  textSecondary: "#7f8c8d",    // sous-titres, infos secondaires
  textMuted: "#95a5a6",        // placeholders, labels discrets
  textLight: "#bdc3c7",        // disabled, séparateurs texte

  // Marque / Actions
  primary: "#3498db",          // boutons principaux, accents, liens
  primaryLight: "#d1e9ff",     // badge shared, fonds teintés bleu
  primaryBg: "#f0f7ff",        // fond item actif (household)
  primarySubtle: "#E3F2FD",    // bannière refresh

  // Succès
  success: "#27ae60",          // boutons add, progress bar, montants positifs
  successLight: "#2ecc71",     // variante claire
  successBg: "#ebf5fb",        // icône fond success

  // Danger / Alerte
  danger: "#e74c3c",           // boutons delete, textes d'erreur
  dangerBg: "#FFF5F5",         // fond warning box
  dangerBorder: "#FEB2B2",     // bordure warning box

  // Avertissement
  warning: "#e67e22",          // dispatch auto, priorité haute
  warningBg: "#fdf2e9",        // fond warning léger
  warningBgAlt: "#fff3e0",     // dispatch item auto
  warningText: "#d35400",      // texte warning

  // Neutre
  neutral100: "#F1F3F5",       // fonds de switch, monthArrow, cancel btn
  neutral200: "#E2E8F0",       // bordures inputs (EpargneScreen)
  neutral300: "#ecf0f1",       // fonds payeur, inputs ChargeFixeItem
  neutral400: "#e0e4e8",       // bordure switchContainer
  neutral500: "#ddd",          // bordures inputs génériques
  neutral600: "#f0f0f0",       // séparateurs, bordures menus
  neutral700: "#edf2f7",       // bordures cards tirelire / subCard

  // Badge solo
  badgeSoloBg: "#e0e6ed",
  badgeSoloText: "#546e7a",

  // Couleur accentuée (ChargeFixeItem)
  accent: "#d14127",           // borderLeft charge fixe item
} as const;

// ── Espacements ───────────────────────────────
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// ── Border radius ─────────────────────────────
export const radius = {
  xs: 5,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 15,
  xxl: 20,
  full: 999,
} as const;

// ── Typographie ───────────────────────────────
export const typography = {
  h1: { fontSize: 24, fontWeight: "800" as const, color: colors.textPrimary },
  h2: { fontSize: 20, fontWeight: "800" as const, color: colors.textPrimary },
  h3: { fontSize: 18, fontWeight: "800" as const, color: colors.textPrimary },
  h4: { fontSize: 16, fontWeight: "700" as const, color: colors.textPrimary },
  body:    { fontSize: 15, color: colors.textPrimary },
  bodyMd:  { fontSize: 14, color: colors.textSecondary },
  bodySm:  { fontSize: 13, color: colors.textSecondary },
  caption: { fontSize: 12, color: colors.textMuted },
  label: {
    fontSize: 12,
    fontWeight: "800" as const,
    color: colors.textMuted,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
} as const;

// ── Ombres ────────────────────────────────────
export const shadows = {
  none: {},
  xs: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
} as const;