import { StyleSheet } from "react-native";
import { colors, spacing, radius } from "../../theme.style";

export const styles = StyleSheet.create({

  // ── Layout ────────────────────────────────────
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.backgroundAlt,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Header logo ───────────────────────────────
  headerContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 400,
    height: 200,
  },

  // ── Formulaire ────────────────────────────────
  formContainer: {
    width: "100%",
    maxWidth: 320,
    gap: spacing.md + 3,
  },

  // ── Succès ────────────────────────────────────
  successContainer: {
    alignItems: "center",
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  successIcon: {
    fontSize: 40,
    color: colors.surface,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.success,
    marginBottom: spacing.sm + 2,
  },
  successSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },

  // ── En attente ────────────────────────────────
  waitingContainer: {
    alignItems: "center",
  },
  waitingTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginTop: 30,
    marginBottom: spacing.md + 3,
    textAlign: "center",
  },
  waitingDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: spacing.xl,
  },
  emailText: {
    fontWeight: "bold",
    color: colors.textPrimary,
  },

  // ── Actions ───────────────────────────────────
  actionsContainer: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: colors.neutral300,
    marginTop: 40,
    paddingTop: spacing.xl,
  },
  resendButton: {
    padding: spacing.md + 3,
    borderRadius: radius.sm,
    marginBottom: spacing.md + 3,
  },
  resendButtonEnabled: {
    backgroundColor: colors.primary,
  },
  resendButtonDisabled: {
    backgroundColor: colors.textLight,
  },
  resendButtonText: {
    color: colors.surface,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  logoutButton: {
    padding: spacing.md + 3,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  logoutButtonText: {
    color: colors.primary,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
});