import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
  },
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  contentContainer: {
    padding: 15,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 25,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 16,
    padding: 20,
  },

  agenceCard: {
    width: "100%",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#fef9e7",
    borderLeftWidth: 6,
    borderLeftColor: "#f39c12",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  agenceLabel: {
    fontSize: 16,
    color: "#7f8c8d",
    fontWeight: "700",
    marginBottom: 5,
  },
  agenceMontant: {
    fontSize: 40,
    fontWeight: "900",
    color: "#f39c12",
    marginBottom: 5,
  },
  agenceMessage: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 10,
    textAlign: "center",
  },
  agenceNote: {
    fontSize: 13,
    textAlign: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#bdc3c7",
    color: "#34495e",
  },

  card: {
    width: "100%",
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
  },
  cardCredit: {
    backgroundColor: "#e8f8f5",
    borderLeftWidth: 6,
    borderLeftColor: "#2ecc71",
  },
  cardDebit: {
    backgroundColor: "#fdedec",
    borderLeftWidth: 6,
    borderLeftColor: "#e74c3c",
  },
  cardLabel: {
    fontSize: 14,
    color: "#7f8c8d",
    fontWeight: "600",
    marginBottom: 5,
  },
  mainSolde: {
    fontSize: 48,
    fontWeight: "900",
    color: "#2c3e50",
  },
  cardMessage: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 10,
    fontWeight: "500",
    color: "#34495e",
  },

  statusBadge: {
    backgroundColor: "#3498db",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 30,
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  detailSection: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#34495e",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  detailLabel: {
    fontSize: 15,
    color: "#34495e",
    flex: 1,
    flexShrink: 1,
    marginRight: 10,
  },
  detteMontant: {
    fontSize: 15,
    fontWeight: "600",
    minWidth: 75,
    textAlign: "right",
  },
  detteCredit: {
    color: "#2ecc71",
  },
  detteDebit: {
    color: "#e74c3c",
  },
  detailSeparator: {
    height: 1,
    backgroundColor: "#bdc3c7",
    marginVertical: 10,
  },
  detailTotalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
  },
});
