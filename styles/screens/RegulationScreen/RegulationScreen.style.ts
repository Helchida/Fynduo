import { StyleSheet } from "react-native";
import { common } from "../../common.style";
import { colors, spacing, radius } from "../../theme.style";

export const styles = StyleSheet.create({
  // ── Containers ──────────────────────────────
  container: {
    ...common.lightScreen,
  },

  contentContainer: {
    padding: spacing.lg,
    paddingBottom: 40,
  },

  // ── Validation ──────────────────────────────
  validationContainer: {
    marginTop: spacing.xl,
    marginBottom: 40,
  },

  // ── Status badge ──────────────────────────────
  statusBadge: {
    backgroundColor: colors.warning,
    padding: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.xl,
    alignItems: "center",
  },
  statusText: {
    color: colors.surface,
    fontWeight: "bold",
  },
  // ── Bouton validation (variante success déjà proche de addButton)
  validationButton: {
    backgroundColor: colors.success,
    padding: 14,
    borderRadius: radius.sm,
    marginBottom: spacing.lg,
    alignItems: "center",
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  validationButtonText: {
    color: colors.surface,
    fontWeight: "700",
    fontSize: 16,
  },
});
