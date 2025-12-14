import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
  },
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 40,
  },
  statusBadge: {
    backgroundColor: "#f39c12",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
  },
  validationContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  validationButton: {
    backgroundColor: "#27ae60",
    padding: 14,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#27ae60",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  validationButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
