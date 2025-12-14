import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  input: {
    padding: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 14,
  },
  chargeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  descriptionInput: {
    flex: 2,
    marginRight: 8,
    backgroundColor: "#fcfcfc",
  },
  montantInput: {
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
