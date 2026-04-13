import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  content: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#2c3e50",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
