import { StyleSheet } from "react-native";
import { colors, spacing } from "../../../../theme.style";

export const styles = StyleSheet.create({

  // ── Ligne bénéficiaire ────────────────────────
  beneficiaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.neutral100,
  },

  // ── Checkbox ──────────────────────────────────
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },

  // ── Textes ────────────────────────────────────
  beneficiaryName: {
    color: "#000",
    fontSize: 16,
  },
  beneficiaryAmount: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
});