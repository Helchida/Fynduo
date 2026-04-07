import { StyleSheet } from "react-native";
import { colors, spacing, radius } from "../../theme.style";

export const styles = StyleSheet.create({

  // ── Layout ────────────────────────────────────
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.backgroundAlt,
    minHeight: "100vh" as any,
  },

  // ── Liens ─────────────────────────────────────
  forgotPasswordButton: {
    marginTop: spacing.md + 3,
    alignItems: "center",
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "500",
  },
  registerContainer: {
    marginTop: spacing.xl,
    alignItems: "center",
  },
  registerText: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  registerLink: {
    color: colors.primary,
    fontWeight: "bold",
  },

  // ── Feedback inline (Login) ───────────────────
  errorContainer: {
    backgroundColor: "#f8d7da",
    padding: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.md + 3,
    borderLeftWidth: 4,
    borderLeftColor: "#dc3545",
  },
  errorText: {
    color: "#721c24",
    fontSize: 14,
    fontWeight: "500",
  },
  successFeedbackContainer: {
    backgroundColor: "#d4edda",
    padding: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.md + 3,
    borderLeftWidth: 4,
    borderLeftColor: "#28a745",
  },
  successFeedbackText: {
    color: "#155724",
    fontSize: 14,
    fontWeight: "500",
  },
  warningFeedbackContainer: {
    backgroundColor: "#fff3cd",
    padding: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.xs + 1,
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
  },
  warningFeedbackText: {
    color: "#856404",
    fontSize: 14,
  },
});