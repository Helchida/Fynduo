import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f7f9", padding: 20 },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 20,
    textAlign: "left",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E9ECEF",
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 11 },
  activeTab: {
    backgroundColor: "#FFFFFF",
    elevation: 3,
    ...Platform.select({
      web: { boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  tabText: { fontWeight: "600", color: "#6C757D", fontSize: 14 },
  activeTabText: { color: "#007AFF" },
  monthSelector: {
    marginBottom: 20,
  },
  monthScrollContent: {
    paddingHorizontal: 4,
  },
  monthButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: "#E9ECEF",
  },
  monthButtonActive: {
    backgroundColor: "#007AFF",
    elevation: 2,
    ...Platform.select({
      web: { boxShadow: "0px 2px 6px rgba(0, 122, 255, 0.3)" },
      default: {
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
    }),
  },
  monthButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6C757D",
  },
  monthButtonTextActive: {
    color: "#FFFFFF",
  },
  yearSelector: {
    marginBottom: 20,
  },
  yearButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  yearButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#E9ECEF",
    minWidth: 80,
    alignItems: "center",
  },
  yearButtonActive: {
    backgroundColor: "#007AFF",
    elevation: 2,
    ...Platform.select({
      web: { boxShadow: "0px 2px 6px rgba(0, 122, 255, 0.3)" },
      default: {
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
    }),
  },
  yearButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6C757D",
  },
  yearButtonTextActive: {
    color: "#FFFFFF",
  },
  periodButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 20,
    elevation: 2,
    ...Platform.select({
      web: { boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.08)" },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
    }),
  },
  periodButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  periodButtonIcon: {
    fontSize: 12,
    color: "#007AFF",
  },
  chargeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f2f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e1e4e8",
  },
  chargeIcon: {
    fontSize: 18,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    elevation: 2,
    ...Platform.select({
      web: { boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.08)" },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
    }),
  },
  triggerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    lineHeight: Platform.OS === "ios" ? 0 : 20,
    textAlignVertical: "center",
  },
  triggerChevron: {
    color: "#007AFF",
  },
  modalBackdrop: {
    flex: 1,
  },
  menu: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    minWidth: 160,
    elevation: 8,
    ...Platform.select({
      web: { boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.12)" },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
    }),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemActive: {
    backgroundColor: "#F0F7FF",
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D3436",
  },
  menuItemTextActive: {
    color: "#007AFF",
  },
  checkmark: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "700",
  },
});
