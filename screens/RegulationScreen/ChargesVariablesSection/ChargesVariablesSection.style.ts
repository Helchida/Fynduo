import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  section: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#2c3e50",
  },
  container: {
    gap: 10,
  },
  balanceBadge: {
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#2ecc71",
    flexDirection: "row",
    alignItems: "center",
  },
  balanceText: {
    fontSize: 14,
    color: "#2c3e50",
    lineHeight: 20,
  },
  amountBold: {
    fontWeight: "700",
    color: "#27ae60",
  },
  noDetteBadge: {
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#95a5a6",
  },
  noDetteText: {
    fontSize: 14,
    color: "#7f8c8d",
    fontStyle: "italic",
  },
});
