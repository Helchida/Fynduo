import { StyleSheet } from "react-native";
import { colors, spacing, radius, shadows, typography } from "../../theme.style";

export const styles = StyleSheet.create({

  // ── Layout ────────────────────────────────────
  container: {
    flex: 1,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  header: {
    ...typography.h1,
    textAlign: "center",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },

  // ── États ─────────────────────────────────────
  loading: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: colors.primary,
  },
  warning: {
    color: "#d9534f",
    backgroundColor: "#f2dede",
    padding: spacing.sm + 2,
    borderRadius: radius.sm,
    marginBottom: spacing.md + 3,
    textAlign: "center",
  },

  // ── Formulaire ────────────────────────────────
  dropdownInput: {
    justifyContent: "center",
    minHeight: 48,
    paddingVertical: spacing.md,
  },
  inputText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
  },

  // ── Bannière refresh ──────────────────────────
  refreshingBanner: {
    backgroundColor: colors.primarySubtle,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
    alignItems: "center",
  },
  refreshingText: {
    color: "#1976D2",
    fontSize: 14,
    fontWeight: "500",
  },

  // ── Info modal ────────────────────────────────
  infoButton: {
    padding: spacing.xs + 1,
  },
  infoIcon: {
    fontSize: 24,
  },
  infoModalContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xxl,
    margin: spacing.xl,
    maxWidth: 400,
    alignSelf: "center",
    ...shadows.md,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  infoModalButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.sm,
    marginTop: spacing.lg,
  },
  infoModalButtonText: {
    color: colors.surface,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
});