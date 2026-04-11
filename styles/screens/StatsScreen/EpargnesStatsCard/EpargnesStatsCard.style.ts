import { StyleSheet } from "react-native";
import { colors, spacing, radius } from "../../../../styles/theme.style";

export const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    marginBottom: spacing.xl,
  },

  chartTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: 14,
    width: "100%",
  },
  titleWrapper: {
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
  },
  chartTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  chartTitleUnderline: {
    height: 3,
    width: 40,
    borderRadius: 2,
    marginTop: spacing.xs,
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    textAlign: "center",
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },

  focusedPercentage: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2ecc71",
    marginTop: spacing.xs,
  },

  deposeValue: { color: "#2ecc71" },
  retireValue: { color: "#e74c3c" },

  mouvementsList: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  mouvementItem: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#2ecc71",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  mouvementItemRetrait: {
    borderLeftColor: "#e74c3c",
  },
  mouvementInfo: { flex: 1, justifyContent: "center" },
  mouvementTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  mouvementType: { fontSize: 15, fontWeight: "600", color: colors.textPrimary },
  mouvementDate: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  mouvementMontantContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: spacing.sm + 2,
  },
  mouvementMontant: { fontSize: 16, fontWeight: "700" },
  mouvementDepose: { color: "#2ecc71" },
  mouvementRetire: { color: "#e74c3c" },

  comparatifSection: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral100,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },

  balanceCards: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  balanceCard: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    alignItems: "center",
    gap: spacing.xxs,
  },
  balanceCardDepose: {
    backgroundColor: "#2ecc7112",
    borderWidth: 1,
    borderColor: "#2ecc7130",
  },
  balanceCardRetire: {
    backgroundColor: "#e74c3c12",
    borderWidth: 1,
    borderColor: "#e74c3c30",
  },
  balanceCardLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  balanceCardAmount: { fontSize: 16, fontWeight: "800" },

  balanceBarContainer: {
    marginBottom: spacing.lg,
  },
  balanceBarTrack: {
    flexDirection: "row",
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: colors.neutral100,
  },
  balanceBarSegmentDepose: {
    backgroundColor: "#2ecc71",
  },
  balanceBarSegmentRetire: {
    backgroundColor: "#e74c3c",
  },
  balanceBarLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  balanceBarPct: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
  },

  netRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.neutral100,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  netLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  netValue: { fontSize: 18, fontWeight: "800" },
  netPositif: { color: "#2ecc71" },
  netNegatif: { color: "#e74c3c" },

  lineChartSection: {
    marginTop: spacing.xl,
  },
  lineLegend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xl,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  lineLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  lineLegendDash: {
    width: 18,
    height: 3,
    borderRadius: 2,
  },
  lineLegendText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  lineChartWrapper: {
    alignItems: "center",
    marginTop: spacing.xs,
  },
  lineAxisText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  lineXLabel: {
    fontSize: 9,
    color: colors.textSecondary,
    textAlign: "center",
  },
});