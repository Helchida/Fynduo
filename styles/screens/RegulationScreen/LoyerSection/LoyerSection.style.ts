import { StyleSheet } from "react-native";
import { colors, spacing, radius } from "../../../../styles/theme.style";

export const styles = StyleSheet.create({

  // ── Formulaire loyer ──────────────────────────
  inputGroup: {
    marginBottom: spacing.sm + 2,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs + 1,
  },
  mainInput: {
    backgroundColor: colors.neutral300,
    padding: spacing.sm + 2,
    borderRadius: radius.xs,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.textLight,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xs + 1,
  },
  inputGroupHalf: {
    width: "48%",
  },
});