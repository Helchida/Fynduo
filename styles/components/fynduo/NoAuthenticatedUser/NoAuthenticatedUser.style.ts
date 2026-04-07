import { StyleSheet } from "react-native";
import { colors, spacing, radius, shadows } from "../../../../styles/theme.style";

export const styles = StyleSheet.create({

  // ── Layout ────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },

  // ── Card ──────────────────────────────────────
  card: {
    backgroundColor: colors.surface,
    padding: 30,
    borderRadius: radius.xl,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    ...shadows.lg,
    shadowOpacity: 0.1,
  },
  icon: {
    fontSize: 50,
    marginBottom: spacing.xl,
  },

  // ── Textes ────────────────────────────────────
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.sm + 2,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },

  // ── Bouton ────────────────────────────────────
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: radius.lg,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
  },
});