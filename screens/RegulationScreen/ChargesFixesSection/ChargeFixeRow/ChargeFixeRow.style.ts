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
    width: "100%",
  },
  descriptionInput: {
    flex: 6,
    marginRight: 8,
    backgroundColor: "#fcfcfc",
  },
  montantInput: {
    flex: 3,
    width: 100,
    marginRight: 8,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#e74c3c",
    aspectRatio: 1,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
