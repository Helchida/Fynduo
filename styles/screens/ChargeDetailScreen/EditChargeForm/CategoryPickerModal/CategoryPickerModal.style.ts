import { StyleSheet } from "react-native";
import { colors, spacing, radius, shadows } from "../../../../theme.style";

export const styles = StyleSheet.create({

  // ── Modal ─────────────────────────────────────

  modalHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xs + 1,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  addCategoryText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 15,
  },

  // ── Items ─────────────────────────────────────
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm + 2,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    ...shadows.xs,
  },
  modalItemSelected: {
    backgroundColor: "#F2F9FF",
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  modalItemText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginLeft: spacing.md + 3,
  },

  // ── Formulaire ajout catégorie ────────────────
  inputContainer: {
    backgroundColor: "#f9f9f9",
    padding: spacing.lg + 2,
    borderRadius: radius.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: "#eee",
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.neutral500,
    borderRadius: radius.sm,
    padding: spacing.md,
    fontSize: 16,
    color: "#333",
  },
  emojiButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.neutral500,
    borderRadius: radius.sm,
    width: 55,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Boutons action ────────────────────────────
  buttonRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm + 2,
  },
  actionButton: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    backgroundColor: colors.success,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  buttonText: {
    color: colors.surface,
    fontWeight: "bold",
    fontSize: 16,
  },

  // ── Fermeture ─────────────────────────────────
  modalCloseButton: {
    marginTop: spacing.md + 3,
    padding: spacing.lg,
    backgroundColor: colors.neutral100,
    borderRadius: radius.lg,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: colors.textSecondary,
    fontWeight: "700",
    fontSize: 16,
  },
});