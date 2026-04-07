import { StyleSheet } from "react-native";
import { colors, spacing, radius } from "../../../../theme.style";

export const styles = StyleSheet.create({

  // ── Items ─────────────────────────────────────
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.md + 3,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.neutral100,
    alignItems: "center",
  },
  modalItemSelected: {
    backgroundColor: "#F2F9FF",
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
  },

  // ── Fermeture ─────────────────────────────────
  modalCloseButton: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.neutral100,
    borderRadius: radius.lg,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: colors.danger,
    fontWeight: "600",
    fontSize: 16,
  },
});