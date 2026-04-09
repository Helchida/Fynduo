import { StyleSheet } from "react-native";
import { colors, spacing, radius, shadows } from "../../../theme.style";

export const styles = StyleSheet.create({

  // ── Item ──────────────────────────────────────
  chargeItem: {
    padding: spacing.md + 3,
    marginBottom: spacing.sm + 2,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderLeftWidth: 5,
    borderLeftColor: colors.accent,
    ...shadows.xs,
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },

  // ── Infos ─────────────────────────────────────
  chargeName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    flex: 10,
  },
  chargePayer: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },

  // ── Payeur ────────────────────────────────────
  payeurContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm + 2,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
    backgroundColor: colors.neutral300,
    borderRadius: radius.xs,
  },
  payeurLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "bold",
    marginRight: spacing.xs + 1,
  },
  payeurName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    textDecorationLine: "underline",
  },

  // ── Input montant ─────────────────────────────
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs + 1,
  },
  currency: {
    fontSize: 18,
    marginRight: spacing.xs + 1,
    fontWeight: "bold",
    color: colors.success,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.textLight,
    padding: spacing.sm + 2,
    marginRight: spacing.sm,
    borderRadius: radius.xs + 1,
    backgroundColor: colors.neutral300,
    fontSize: 16,
    minWidth: 0,
  },

  // ── Boutons ───────────────────────────────────
  saveButton: {
    backgroundColor: colors.successLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.xs,
    minWidth: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    color: colors.surface,
    fontWeight: "bold",
    fontSize: 12,
  },
  disabledButton: {
    backgroundColor: colors.textLight,
    opacity: 0.7,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "auto",
  },
  deleteButtonText: {
    color: colors.surface,
    fontWeight: "bold",
    fontSize: 14,
  },
});