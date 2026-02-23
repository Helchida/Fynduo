import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    marginBottom: 20,
  },
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  legendItem: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  catName: { fontSize: 15, fontWeight: "600", color: "#2D3436" },
  catPercent: { fontSize: 12, color: "#A0A0A0", marginTop: 2 },
  catValue: { fontSize: 16, fontWeight: "700", color: "#2D3436" },
  indicator: { width: 20, height: 3, borderRadius: 2, marginTop: 4 },
  chargesList: {
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  chargeItem: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#9b59b6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  chargeInfo: {
    flex: 1,
    justifyContent: "center",
  },
  chargeLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2c3e50",
  },
  chargePayeur: {
    fontSize: 11,
    color: "#7f8c8d",
    marginTop: 2,
  },
  chargeMontantContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 10,
  },
  chargeMontant: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2c3e50",
  },
  chargeDate: {
    fontSize: 11,
    color: "#95A5A6",
    marginTop: 2,
  },
  emptyText: {
    textAlign: "center",
    color: "#95A5A6",
    marginVertical: 20,
    fontSize: 15,
  },
  chartTitleContainer: {
    flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between", // Pousse la flèche à l'extrémité
  backgroundColor: "#FFFFFF",      // Comme le bouton de période
  paddingHorizontal: 20,           // Même padding
  paddingVertical: 14,             // Même padding
  borderRadius: 14,
  width: "100%",
  },
  titleWrapper: {
    flexDirection: "column",
  alignItems: "center", // Garde le titre et le souligné au centre
  flex: 1,
  },
  chartTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#2c3e50",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  chartTitleUnderlineVariable: {
    height: 3,
    width: 40,
    backgroundColor: "#2ecc71",
    borderRadius: 2,
    marginTop: 4,
  },
  chartTitleUnderlineFixe: {
    height: 3,
    width: 40,
    backgroundColor: "#d14127ff",
    borderRadius: 2,
    marginTop: 4,
  },
  chartTitleUnderlineAll: {
    height: 3,
    width: 40,
    backgroundColor: "#9b59b6",
    borderRadius: 2,
    marginTop: 4,
  },
  focusedCategory: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 4,
  },
  focusedPercentage: {
    fontSize: 28,
    fontWeight: "800",
    color: "#9b59b6",
    marginTop: 4,
  },
  focusedAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6C757D",
    marginTop: 2,
  },
  totalAmount: { fontSize: 20, fontWeight: "bold", color: "#1A1A1A" },
  totalLabel: {
    fontSize: 10,
    color: "#95A5A6",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  legendWrapper: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F3F5",
    paddingTop: 20,
    padding: 20,
  },
  collapsedButtonIcon: {
    fontSize: 12,
    color: "#007AFF",
  },
});
