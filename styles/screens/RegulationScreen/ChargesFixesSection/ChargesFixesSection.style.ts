import { StyleSheet } from "react-native";
import { colors, spacing, radius } from "../../../../styles/theme.style";

export const styles = StyleSheet.create({

  // ── Sous-section ──────────────────────────────
  subSection: {
    padding: spacing.sm + 2,
    backgroundColor: "#f9f9f9",
    borderRadius: radius.sm,
    marginBottom: spacing.sm + 2,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  subSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm + 2,
  },
  subSectionTitle: {
    fontWeight: "600",
    fontSize: 15,
    color: colors.primary,
  },

  // ── Bouton ajout inline ───────────────────────
  addButton: {
    backgroundColor: colors.successLight,
    paddingVertical: spacing.xs + 1,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.xs,
  },
  addButtonText: {
    color: colors.surface,
    fontWeight: "bold",
    fontSize: 14,
  },
});