import { Platform, StyleSheet } from "react-native";
import { colors, spacing, radius, shadows } from "../../theme.style";

export const styles = StyleSheet.create({

  // ── Layout ────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Cards ─────────────────────────────────────
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md + 3,
    borderRadius: radius.md,
    marginBottom: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    ...shadows.md,
    shadowRadius: 3,
  },
  aplCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },

  // ── Formulaire ────────────────────────────────
  dropdownInput: {
    justifyContent: "center",
    minHeight: 44,
  },
  inputText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
  },
  disabledInput: {
    backgroundColor: colors.neutral600,
    borderColor: "#eee",
  },

  // ── Résultat ──────────────────────────────────
  resultContainer: {
    marginTop: 30,
    padding: spacing.md + 3,
    backgroundColor: colors.neutral300,
    borderRadius: radius.sm,
    borderLeftWidth: 5,
    borderLeftColor: colors.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultLabel: {
    fontSize: 16,
    color: "#34495e",
    fontWeight: "600",
  },
  resultValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2980b9",
  },

  // ── Validation ────────────────────────────────
  validationContainer: {
    marginTop: 30,
  },
  validationButton: {
    backgroundColor: colors.successLight,
    padding: spacing.md + 3,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    shadowColor: colors.successLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  validationButtonText: {
    color: colors.surface,
    fontWeight: "700",
    fontSize: 18,
  },

  // ── Section ───────────────────────────────────
  section: {
    marginBottom: spacing.xl,
    padding: spacing.md + 3,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    ...shadows.md,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: spacing.xs + 1,
  },
});