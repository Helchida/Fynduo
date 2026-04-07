import { StyleSheet } from "react-native";
import { colors, spacing, radius, shadows } from "../../theme.style";

export const styles = StyleSheet.create({

  // ── Layout ────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    paddingHorizontal: spacing.sm + 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },

  // ── Titre ─────────────────────────────────────
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
    paddingVertical: spacing.md + 3,
    paddingHorizontal: spacing.sm + 2,
    marginBottom: spacing.xs + 1,
  },

  // ── Card mois ─────────────────────────────────
  monthCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md + 3,
    marginVertical: spacing.xs + 1,
    marginHorizontal: spacing.xs + 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 5,
    borderLeftColor: "#34495e",
    ...shadows.md,
    shadowRadius: 3,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    flex: 2,
  },
  statusBadge: {
    backgroundColor: colors.successLight,
    color: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.xl,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: spacing.sm + 2,
  },
  detailText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "500",
  },

  // ── Section année ─────────────────────────────
  yearSection: {
    marginBottom: spacing.md + 3,
    borderRadius: radius.md,
    backgroundColor: "#f5f5f5",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.neutral500,
  },
  yearHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md + 3,
    backgroundColor: colors.textPrimary,
  },
  yearText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.surface,
  },
  arrow: {
    fontSize: 18,
    color: colors.surface,
  },
  yearContent: {
    paddingTop: spacing.xs + 1,
    paddingBottom: spacing.xs + 1,
    paddingHorizontal: spacing.sm + 2,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.neutral500,
  },
  monthSubCard: {
    backgroundColor: colors.neutral300,
    marginBottom: spacing.sm,
    marginTop: spacing.xs + 1,
    paddingHorizontal: spacing.md + 3,
    borderRadius: radius.xs + 1,
  },
});