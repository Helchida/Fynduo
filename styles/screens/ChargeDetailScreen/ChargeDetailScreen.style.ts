import { StyleSheet } from "react-native";
import { colors, spacing, radius, typography } from "../../theme.style";

export const styles = StyleSheet.create({

  // ── Layout ────────────────────────────────────
  detailContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  detailHeaderContainer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    marginBottom: spacing.md + 3,
  },
  cardSection: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md + 3,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md + 3,
  },

  // ── Textes header ─────────────────────────────
  iconText: {
    fontSize: 30,
    color: colors.surface,
  },
  detailTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginTop: spacing.xs + 1,
    textAlign: "center",
  },
  detailDateText: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },

  // ── Bouton action (coloré dynamiquement) ──────
  addButton: {
    padding: 14,
    borderRadius: radius.sm,
    alignItems: "center",
    elevation: 3,
  },
  addButtonText: {
    color: colors.surface,
    fontWeight: "700",
    fontSize: 16,
  },
});