import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  beneficiaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F2F2F7",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#3498DB",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#3498DB",
  },
  beneficiaryName: {
    color: "#000",
    fontSize: 16,
  },
  beneficiaryAmount: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  payorCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#27ae60",
    marginBottom: 10,
    marginTop: 5,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 1,
  },
  editSectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  editLabel: {
    color: "#8E8E93",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
  },
});
