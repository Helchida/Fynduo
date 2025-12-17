import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  detailContainer: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  detailHeaderContainer: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 15,
  },
  iconPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F39C12",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  iconText: {
    fontSize: 30,
    color: "#fff",
  },
  detailTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
    textAlign: "center",
  },
  detailDateText: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  cardSection: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7f8c8d",
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  addButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    elevation: 3,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});