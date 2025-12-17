import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F2F2F7",
    alignItems: "center",
  },
  modalItemSelected: {
    backgroundColor: "#F2F9FF",
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "#E74C3C",
    fontWeight: "600",
    fontSize: 16,
  },
});