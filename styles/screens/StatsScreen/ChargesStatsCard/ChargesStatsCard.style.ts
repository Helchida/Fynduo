import { StyleSheet } from "react-native";
import { colors, spacing, radius } from "../../../../styles/theme.style";

export const styles = StyleSheet.create({
  // ── Liste des charges ─────────────────────────
  chargesList: {
    marginLeft: 0,
    marginRight: 0,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  chargeItem: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#9b59b6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  chargeInfo: { flex: 1, justifyContent: "center" },
  chargeLabel: { fontSize: 15, fontWeight: "600", color: colors.textPrimary },
  chargePayeur: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  chargeMontantContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: spacing.sm + 2,
  },
  chargeMontant: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  chargeDate: { fontSize: 11, color: "#95A5A6", marginTop: spacing.xxs },

  // ── Titre du chart ────────────────────────────
  chartTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: 14,
    width: "100%",
  },
  titleWrapper: {
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
  },
  chartTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  chartTitleUnderlineVariable: {
    height: 3,
    width: 40,
    backgroundColor: colors.successLight,
    borderRadius: 2,
    marginTop: spacing.xs,
  },
  chartTitleUnderlineFixe: {
    height: 3,
    width: 40,
    backgroundColor: colors.accent,
    borderRadius: 2,
    marginTop: spacing.xs,
  },
  chartTitleUnderlineAll: {
    height: 3,
    width: 40,
    backgroundColor: "#9b59b6",
    borderRadius: 2,
    marginTop: spacing.xs,
  },

  // ── Focus catégorie ───────────────────────────
  focusedPercentage: {
    fontSize: 28,
    fontWeight: "800",
    color: "#9b59b6",
    marginTop: spacing.xs,
  },

  // ── Bouton collapse ───────────────────────────
  collapsedButtonIcon: { fontSize: 12, color: "#007AFF" },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    marginBottom: spacing.xl,
  },
});
