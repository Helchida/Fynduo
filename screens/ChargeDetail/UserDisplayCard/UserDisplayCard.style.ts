import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 1,
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
  userName: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  userCurrentTag: {
    fontSize: 14,
    color: "#7f8c8d",
    fontStyle: "italic",
  },
  cardAmount: {
    fontSize: 17,
    fontWeight: "600",
    minWidth: 70,
    textAlign: "right",
    color: "#333",
  },
});
