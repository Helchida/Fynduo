import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: "#f4f7f9",
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  loading: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "#5bc0de",
  },

  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  logoutButtonTop: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#fbebeb",
  },
  logoutTextTop: {
    color: "#e74c3c",
    fontWeight: "600",
    fontSize: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 20,
    textAlign: "center",
  },
  historyCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  historyNavigator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 150,
  },
  navArrow: {
    padding: 10,
    opacity: 0.6,
  },
  navArrowText: {
    fontSize: 28,
    fontWeight: "200",
    color: "#3498db",
  },
  chartArea: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: "100%",
    paddingHorizontal: 5,
  },
  historyColumn: {
    alignItems: "center",
    width: "30%",
  },
  bar: {
    width: 35,
    backgroundColor: "#3498db",
    borderRadius: 5,
    marginBottom: 5,
    opacity: 0.85,
  },
  historyTotalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  historyMonthLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    marginTop: 4,
  },

  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  actionButton: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    width: "48%",
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    minHeight: width * 0.25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderLeftWidth: 4,
    borderLeftColor: "#3498db",
  },
  actionText: {
    fontWeight: "700",
    color: "#2c3e50",
    textAlign: "center",
    fontSize: 15,
  },
});
