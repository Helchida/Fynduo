import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  householdItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 12,
    marginBottom: 4,
  },
  activeHouseholdItem: {
    backgroundColor: "#f0f7ff",
    borderLeftWidth: 3,
    borderLeftColor: "#3498db",
  },
  householdItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2c3e50",
    flex: 1,
  },
  activeHouseholdText: {
    color: "#3498db",
    fontWeight: "700",
  },
});
