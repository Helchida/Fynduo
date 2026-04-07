import { StyleSheet } from "react-native";
import { colors, spacing, radius } from "../../../../styles/theme.style";

export const styles = StyleSheet.create({
  // ── Textes ────────────────────────────────────
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: spacing.sm + 2,
    color: colors.textPrimary,
  },
  message: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },

  // ── Boutons ───────────────────────────────────
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm + 2,
  },
  button: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md + 3,
    borderRadius: radius.sm,
  },
  destructiveButton: { backgroundColor: "#fbebeb" },
  cancelText: { color: colors.textSecondary, fontWeight: "600" },
  confirmText: { color: colors.primary, fontWeight: "700" },
  destructiveText: { color: colors.danger },
});
