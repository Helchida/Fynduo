import { StyleSheet } from "react-native";
import { colors, spacing, radius, shadows } from "../../../theme.style";

export const styles = StyleSheet.create({
  // ── Layout ────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sectionContainer: {
    paddingHorizontal: spacing.xl,
  },

  // ── Card principale ───────────────────────────
  mainCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.md,
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  amountContainer: {
    alignItems: "center",
    marginBottom: spacing.md + 3,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  mainAmount: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.textPrimary,
    marginVertical: spacing.xs + 1,
  },
  goalSmall: {
    fontSize: 16,
    color: colors.textLight,
    fontWeight: "400",
  },
  infoText: {
    fontSize: 14,
    color: colors.success,
    textAlign: "center",
    marginTop: spacing.sm + 2,
    fontWeight: "600",
    fontStyle: "italic",
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral100,
    marginVertical: spacing.md + 3,
  },

  // ── Vrac ──────────────────────────────────────
  vracRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  vracText: {
    fontSize: 20,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    fontWeight: "600",
  },
  vracAmount: {
    color: colors.success,
    fontWeight: "800",
    fontSize: 20,
  },
  vracInfoBox: {
    backgroundColor: "#FEF9E7",
    padding: spacing.sm + 2,
    borderRadius: radius.md,
    marginBottom: spacing.md + 3,
    alignItems: "center",
  },
  vracInfoText: {
    color: colors.warning,
    fontWeight: "700",
  },

  // ── Bouton placer de l'argent ─────────────────
  placeMoneyBtn: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    borderRadius: radius.xl,
    elevation: 3,
  },
  placeMoneyBtnText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "800",
    marginLeft: spacing.sm + 2,
  },

  // ── Badge fuse ────────────────────────────────
  fuseBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.xs + 1,
    marginLeft: spacing.sm + 2,
  },
  fuseText: {
    fontSize: 10,
    color: colors.danger,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  progressBarBg: {
    height: 10,
    backgroundColor: colors.neutral100,
    borderRadius: radius.xs,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: radius.xs,
    backgroundColor: colors.success,
  },
  subCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg + 2,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral700,
  },
  subCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  subAmountRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  subAmountRange: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  subAmountGoal: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "400",
  },
});
