import { StyleSheet } from "react-native";
import { colors, spacing, radius, shadows } from "../../theme.style";

export const styles = StyleSheet.create({

  // ── Layout ────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  contentContainer: {
    padding: spacing.md + 3,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 25,
  },
  errorText: {
    color: colors.danger,
    fontSize: 16,
    padding: spacing.xl,
  },

  // ── Card agence ───────────────────────────────
  agenceCard: {
    width: "100%",
    padding: spacing.xl,
    borderRadius: radius.md,
    marginBottom: spacing.xl,
    backgroundColor: "#fef9e7",
    borderLeftWidth: 6,
    borderLeftColor: "#f39c12",
    ...shadows.md,
    shadowRadius: 3,
  },
  agenceLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: spacing.md + 3,
    color: "#34495e",
  },
  agenceMontant: {
    fontSize: 40,
    fontWeight: "900",
    color: "#f39c12",
    marginBottom: spacing.xs + 1,
  },
  agenceMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm + 2,
    textAlign: "center",
  },
  agenceNote: {
    fontSize: 13,
    textAlign: "center",
    paddingTop: spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: colors.textLight,
    color: "#34495e",
  },

  // ── Card solde ────────────────────────────────
  card: {
    width: "100%",
    padding: 25,
    borderRadius: radius.xl,
    alignItems: "center",
    marginBottom: spacing.xl,
    ...shadows.lg,
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
  },
  cardCredit: {
    backgroundColor: "#e8f8f5",
    borderLeftWidth: 6,
    borderLeftColor: colors.successLight,
  },
  cardDebit: {
    backgroundColor: "#fdedec",
    borderLeftWidth: 6,
    borderLeftColor: colors.danger,
  },
  cardLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "600",
    marginBottom: spacing.xs + 1,
  },
  mainSolde: {
    fontSize: 48,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  cardMessage: {
    fontSize: 18,
    textAlign: "center",
    marginTop: spacing.sm + 2,
    fontWeight: "700",
    color: "#34495e",
  },

  // ── Badge statut ──────────────────────────────
  statusBadge: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md + 3,
    borderRadius: radius.full,
  },
  statusText: {
    color: colors.surface,
    fontWeight: "bold",
    fontSize: 14,
  },

  // ── Section détail ────────────────────────────
  detailSection: {
    width: "100%",
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.md,
    marginBottom: spacing.xl,
    ...shadows.md,
    shadowRadius: 3,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: spacing.md + 3,
    color: "#34495e",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral300,
  },
  detailLabel: {
    fontSize: 15,
    color: "#34495e",
    flex: 1,
    flexShrink: 1,
    marginRight: spacing.sm + 2,
  },
  detteMontant: {
    fontSize: 15,
    fontWeight: "600",
    minWidth: 75,
    textAlign: "right",
  },
  detteCredit: { color: colors.successLight },
  detteDebit: { color: colors.danger },
  detailSeparator: {
    height: 1,
    backgroundColor: colors.textLight,
    marginVertical: spacing.sm + 2,
  },
  detailTotalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
});