import { StyleSheet, Dimensions } from "react-native";

const { height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: height * 0.8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    color: "#007AFF",
    fontSize: 16,
  },
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "#F2F2F7",
    borderRadius: 10,
    padding: 2,
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: "#8E8E93",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#000",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  item: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  selectedItem: {
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  itemText: {
    fontSize: 16,
  },
  selectedItemText: {
    color: "#007AFF",
    fontWeight: "600",
  },
});
