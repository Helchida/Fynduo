import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowOpacity: 0.2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2c3e50",
  },
  message: { fontSize: 15, color: "#7f8c8d", marginBottom: 20, lineHeight: 22 },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  button: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8 },
  destructiveButton: { backgroundColor: "#fbebeb" },
  cancelText: { color: "#7f8c8d", fontWeight: "600" },
  confirmText: { color: "#3498db", fontWeight: "700" },
  destructiveText: { color: "#e74c3c" },
});
