import { StyleSheet } from "react-native";
import { colors, spacing, radius } from "../../../styles/theme.style";

export const styles = StyleSheet.create({
  // ── Layout ────────────────────────────────────
  container: {
    flex: 1,
    padding: spacing.xl,
    backgroundColor: colors.backgroundAlt,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: spacing.xl,
    textAlign: "left",
  },
  list: {
    flex: 1,
    paddingBottom: spacing.xl,
  },
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
  filterChipText: { fontSize: 13, color: "#333" },
  filterChipTextActive: { color: colors.surface, fontWeight: "600" },
  filterClearButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
  },
  filterClearText: { fontSize: 16, color: colors.danger, fontWeight: "600" },
  // ── Séparateur de date (Charges / Revenus) ─────
  dateSeparator: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: spacing.md + 3,
    marginBottom: spacing.xs + 1,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
    color: "#333",
  },
});
