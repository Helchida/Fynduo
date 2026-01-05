import { Platform } from "react-native";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  toast: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 20,
    minWidth: 300,
    maxWidth: 500,
    ...Platform.select({
      web: {
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
      },
    }),
  },
  toastIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  toastContent: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  toastMessage: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  toastClose: {
    marginLeft: 12,
    padding: 4,
  },
});
