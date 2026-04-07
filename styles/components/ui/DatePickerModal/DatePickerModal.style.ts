import { StyleSheet } from "react-native";
import { colors, spacing, radius } from "../../../../styles/theme.style";

export const styles = StyleSheet.create({

  // ── Textes ────────────────────────────────────
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: spacing.xl,
    color: "#333",
  },

  // ── Input HTML (web only) ─────────────────────
  htmlInput: {
    width: "100%",
    padding: spacing.md,
    fontSize: 16,
    borderRadius: radius.sm,
    borderColor: "#EFEFEF",
    borderWidth: 1,
    marginBottom: spacing.xl,
    fontFamily: "inherit",
  },

  // ── Bouton fermeture ──────────────────────────
  closeButton: {
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    paddingHorizontal: 30,
    borderRadius: radius.sm,
    width: "100%",
    alignItems: "center",
  },
  closeButtonText: {
    color: colors.surface,
    fontWeight: "bold",
    fontSize: 16,
  },
});