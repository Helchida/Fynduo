import { StyleSheet } from "react-native";
import { colors, spacing, radius } from "../../../../styles/theme.style";

export const styles = StyleSheet.create({

  // ── Card avec padding (variante revenus) ──────
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },

  // ── Titre du chart ────────────────────────────
  chartTitleContainer: {
    alignItems: "center",
    marginBottom: spacing.sm + 2,
    marginTop: spacing.xs + 1,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  chartTitleUnderline: {
    height: 3,
    width: 40,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginTop: spacing.xs,
  },

  // ── Focus catégorie ───────────────────────────
  focusedPercentage: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.primary,
    marginTop: spacing.xs,
  },

  // ── Liste des revenus ─────────────────────────
  revenusList: {
    marginLeft: 0,
    marginRight: 0,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  revenuItem: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  revenuInfo: { flex: 1, justifyContent: "center" },
  revenuLabel: { fontSize: 15, fontWeight: "600", color: colors.textPrimary },
  revenuPayeur: { fontSize: 11, color: colors.textSecondary, marginTop: spacing.xxs },
  revenuMontantContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: spacing.sm + 2,
  },
  revenuMontant: { fontSize: 16, fontWeight: "700", color: colors.success },
  revenuDate: { fontSize: 11, color: "#95A5A6", marginTop: spacing.xxs },
});