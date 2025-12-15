import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  depenseItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderLeftWidth: 5,
    borderLeftColor: "#2ecc71",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  depenseInfo: { flex: 3 },
  depenseDetails: { flex: 2, alignItems: "flex-end" },
  depenseDesc: { fontSize: 17, fontWeight: "600", color: "#333" },
  depenseAmount: { fontSize: 18, fontWeight: "bold", color: "#e67e22" },
  depensePayer: {
    fontSize: 13,
    color: "#27ae60",
    marginTop: 3,
    fontWeight: "500",
  },
});
