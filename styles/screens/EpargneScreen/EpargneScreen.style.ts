import { StyleSheet } from "react-native";
import { colors, spacing, radius, shadows } from "../../theme.style";

export const styles = StyleSheet.create({
  // ── Layout ────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // ── Sélecteur de mois ─────────────────────────
  monthSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md + 3,
    borderRadius: radius.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.sm,
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
    textTransform: "capitalize",
    minWidth: 150,
    textAlign: "center",
  },
  monthArrow: {
    padding: spacing.sm,
    backgroundColor: colors.neutral100,
    borderRadius: radius.md,
  },

  // ── Card principale épargne ───────────────────
  mainSavingsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    marginBottom: 25,
    marginHorizontal: spacing.xl,
    ...shadows.lg,
    shadowOpacity: 0.05,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bigAmount: {
    fontSize: 36,
    fontWeight: "900",
    marginVertical: spacing.xs + 1,
  },
  miniStatsRow: {
    flexDirection: "row",
    marginTop: spacing.md + 3,
    paddingTop: spacing.md + 3,
    borderTopWidth: 1,
    borderTopColor: colors.neutral100,
  },
  miniStatLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: spacing.xxs,
  },
  miniStatValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  // ── Liste tirelires ───────────────────────────
  tireliresList: {
    marginTop: spacing.sm + 2,
    gap: spacing.md + 3,
  },
  tirelireCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg + 2,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral700,
    marginBottom: spacing.md,
  },
  tirelireHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  tirelireName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#34495e",
  },
  tirelireAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  objectivSmall: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "400",
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: colors.neutral100,
    borderRadius: radius.xs,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.success,
    borderRadius: radius.xs,
  },
  remainingText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontStyle: "italic",
  },

  // ── Warning box ───────────────────────────────
  warningBox: {
    backgroundColor: colors.dangerBg,
    padding: spacing.lg + 2,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    alignItems: "center",
    marginHorizontal: spacing.xl,
  },
  warningText: {
    color: "#C53030",
    fontWeight: "600",
  },

  // ── Total accumulé ────────────────────────────
  totalAccumulatedContainer: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md + 3,
    padding: spacing.lg + 2,
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.neutral300,
    ...shadows.sm,
  },
  totalAccumulatedLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  totalAccumulatedAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textPrimary,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  totalAccumulatedIcon: {
    backgroundColor: colors.successBg,
    padding: spacing.sm + 2,
    borderRadius: radius.full,
  },

  // ── Badge mois courant ────────────────────────
  currentMonthBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xxs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: spacing.xs + 2,
  },
  currentMonthText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: "600",
  },

  // ── Modale casse-tirelire ─────────────────────
  breakCurrentAmount: {
    textAlign: "center",
    marginBottom: spacing.xl,
    color: colors.success,
    fontSize: 16,
    fontWeight: "700",
  },
  breakTirelireName: {
    textAlign: "center",
    marginBottom: spacing.md + 3,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  infoBox: {
    backgroundColor: "#fcf3cf",
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginTop: spacing.sm + 2,
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    fontSize: 12,
    color: colors.warningText,
    marginLeft: spacing.sm,
    flex: 1,
    fontStyle: "italic",
  },
  body: {
    fontSize: 16,
    color: "#1F2937", // Gris foncé (text-gray-800)
    lineHeight: 24,
  },
  bodySm: {
    fontSize: 13,
    color: "#6B7280", // Gris moyen (text-gray-500)
    fontWeight: "400",
  },
});
