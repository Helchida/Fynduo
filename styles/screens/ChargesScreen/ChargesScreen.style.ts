import { StyleSheet } from "react-native";
import { colors, spacing, radius, shadows, typography } from "../../theme.style";

export const styles = StyleSheet.create({

  // ── Layout ────────────────────────────────────
  container: {
    flex: 1,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  header: {
    ...typography.h1,
    marginBottom: spacing.xl,
    textAlign: "left",
  },
  list: {
    flex: 1,
    paddingBottom: spacing.xl,
  },

  // ── États ─────────────────────────────────────
  loading: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: colors.textSecondary,
  },

  // ── Séparateur de date ────────────────────────
  dateSeparator: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: spacing.md + 3,
    marginBottom: spacing.xs + 1,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
    color: "#333",
  },

  // ── Édition inline ────────────────────────────
  inputFieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginTop: spacing.xxs,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    minHeight: 48,
  },
  editInputActive: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    padding: 0,
  },
  editLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: spacing.sm,
    textTransform: "uppercase",
  },

  // ── Filtres ───────────────────────────────────
  filtersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
    alignItems: "center",
  },
  filtersLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: spacing.xs,
    color: "#666",
    marginBottom: spacing.xs,
  },
  filterChip: {
    backgroundColor: colors.neutral600,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral500,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: "#333",
  },
  filterChipTextActive: {
    color: colors.surface,
    fontWeight: "600",
  },
  filterClearButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
  },
  filterClearText: {
    fontSize: 16,
    color: colors.danger,
    fontWeight: "600",
  },

  // ── Balance / virements ───────────────────────
  balanceContainer: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.xl,
    ...shadows.md,
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    paddingLeft: spacing.sm + 2,
  },
  virementRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.neutral600,
  },
  virementText: {
    fontSize: 15,
    color: "#333",
  },
  amountText: {
    fontWeight: "bold",
    color: colors.success,
  },
});