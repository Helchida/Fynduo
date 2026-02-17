import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  revenuItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 5,
    borderLeftColor: "#2ecc71",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0f2f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e1e4e8",
  },
  avatarText: {
    fontSize: 20,
  },
  revenuInfo: {
    flex: 1,
    justifyContent: "center",
  },
  revenuDesc: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },
  revenuMontantContainer: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 4,
    marginLeft: 10,
  },
  revenuMontant: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#2c3e50",
  },
});
