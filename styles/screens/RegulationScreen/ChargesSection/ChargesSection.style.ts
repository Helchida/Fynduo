import { StyleSheet } from "react-native";
import { colors, spacing, radius } from "../../../../styles/theme.style";

export const styles = StyleSheet.create({

  // ── Conteneur items ───────────────────────────
  container: {
    gap: spacing.sm + 2,
  },

  // ── Badge balance ─────────────────────────────
  balanceBadge: {
    padding: spacing.md,
    backgroundColor: "#f9f9f9",
    borderRadius: radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.successLight,
    flexDirection: "row",
    alignItems: "center",
  },
  balanceText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  amountBold: {
    fontWeight: "700",
    color: colors.success,
  },

  // ── Badge no dette ────────────────────────────
  noDetteBadge: {
    padding: spacing.md,
    backgroundColor: "#f9f9f9",
    borderRadius: radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.textMuted,
  },
  noDetteText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
});