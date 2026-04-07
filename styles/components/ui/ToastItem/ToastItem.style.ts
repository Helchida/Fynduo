import { Platform, StyleSheet } from "react-native";
import { colors, spacing, radius } from "../../../../styles/theme.style";

export const styles = StyleSheet.create({

  // ── Toast ─────────────────────────────────────
  toast: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderLeftWidth: 4,
    padding: spacing.lg,
    marginBottom: spacing.md,
    marginHorizontal: spacing.xl,
    minWidth: 300,
    maxWidth: 500,
    ...Platform.select({
      web: {
        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
      },
    }),
  },

  // ── Contenu ───────────────────────────────────
  toastIcon:    { marginRight: spacing.md, marginTop: spacing.xxs },
  toastContent: { flex: 1 },
  toastTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: spacing.xxs,
  },
  toastMessage: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  toastClose: {
    marginLeft: spacing.md,
    padding: spacing.xs,
  },
});