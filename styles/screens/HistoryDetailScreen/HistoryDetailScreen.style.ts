import { StyleSheet } from "react-native";
import { colors, spacing, radius, shadows } from "../../theme.style";

export const styles = StyleSheet.create({

  // ── Layout ────────────────────────────────────
  container: {
    padding: spacing.xl,
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: spacing.xl,
    color: colors.textPrimary,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 50,
  },

  // ── Sections ──────────────────────────────────
  section: {
    backgroundColor: colors.surface,
    padding: spacing.md + 3,
    borderRadius: radius.sm,
    marginBottom: spacing.md + 3,
    ...shadows.sm,
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.sm + 2,
    color: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral300,
    paddingBottom: spacing.xs + 1,
  },
  detail: {
    fontSize: 16,
    marginVertical: spacing.xs,
    color: "#333",
  },
  finalSection: {
    borderLeftWidth: 5,
    borderLeftColor: "#34495e",
  },
  finalDetail: {
    fontSize: 16,
    marginVertical: 3,
    color: "#333",
  },

  // ── Lignes de charges ─────────────────────────
  chargeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs + 1,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  chargeDescription: {
    flex: 1,
    fontSize: 14,
    color: "#555",
  },
  chargeMontant: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginLeft: spacing.sm + 2,
  },
  chargePayeur: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: spacing.sm + 2,
    fontWeight: "bold",
  },

  // ── Solde / dette ─────────────────────────────
  soldeNote: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: spacing.sm + 2,
    width: "100%",
    textAlign: "center",
  },
  soldeNoteDebiteur: { color: colors.danger },
  soldeNoteCrediteur: { color: colors.successLight },
  soldeNoteEquilibre: { color: "#34495e" },

  soldeFinal: {
    fontSize: 24,
    fontWeight: "900",
    color: "#34495e",
    marginBottom: spacing.sm + 2,
    textAlign: "center",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md + 3,
    paddingTop: spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: colors.neutral300,
    flex: 1,
    flexWrap: "wrap",
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#34495e",
    flexShrink: 1,
  },
  dettePayer: { fontSize: 16, fontWeight: "700", color: colors.danger },
  detteRecevoir: { fontSize: 16, fontWeight: "700", color: colors.successLight },
  detteEquilibre: { fontSize: 16, fontWeight: "700", color: colors.primary },
  detteMessageBase: { fontSize: 16, fontWeight: "700" },

  detteContainer: {
    marginTop: spacing.sm + 2,
    width: "100%",
  },

  // ── Régularisation ────────────────────────────
  regularisationSummary: {
    marginTop: spacing.md + 3,
    paddingTop: spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: colors.neutral300,
    width: "100%",
  },
  regularisationNotePayer: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#34495e",
    marginTop: spacing.xs + 1,
    textAlign: "center",
  },
  regularisationNoteEquilibre: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing.xs + 1,
    textAlign: "center",
  },

  // ── Conclusion ────────────────────────────────
  finalConclusionBlock: {
    width: "100%",
  },
  finalConclusionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: spacing.xs + 1,
  },

  // ── Séparateur ────────────────────────────────
  detailSeparator: {
    height: 1,
    backgroundColor: colors.textLight,
    width: "80%",
    alignSelf: "center",
    marginVertical: spacing.md + 3,
  },
});