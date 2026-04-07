import { StyleSheet } from "react-native";
import { colors, spacing, radius, shadows } from "../../theme.style";

export const styles = StyleSheet.create({

  // ── Layout ────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.xl,
    backgroundColor: colors.surface,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  // ── Card ──────────────────────────────────────
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.lg,
    shadowOpacity: 0.05,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.md + 3,
  },

  // ── Input ─────────────────────────────────────
  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: radius.md,
    padding: spacing.md + 3,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: spacing.md + 3,
  },

  // ── Bouton sauvegarde ─────────────────────────
  saveButton: {
    backgroundColor: colors.textPrimary,
    padding: spacing.md + 3,
    borderRadius: radius.md,
    alignItems: "center",
  },
  saveButtonText: {
    color: colors.surface,
    fontWeight: "600",
    fontSize: 15,
  },

  // ── Boutons action (navigation) ───────────────
  actionButton: {
    backgroundColor: colors.surface,
    padding: spacing.lg + 2,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 5,
    ...shadows.sm,
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  actionText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  chevronRight: {
    color: colors.textLight,
  },
});