import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  soloBadge: {
    backgroundColor: "#ebf5ff",
    borderColor: "#badbff",
  },
  sharedBadge: {
    backgroundColor: "#fef9c3",
    borderColor: "#fde047",
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  soloBadgeText: {
    color: "#3182ce",
  },
  sharedBadgeText: {
    color: "#854d0e",
  },
});
