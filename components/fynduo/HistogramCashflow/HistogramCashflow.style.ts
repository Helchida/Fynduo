import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  historyColumn: {
    alignItems: "center",
    width: "33%",
  },
  bar: {
    borderRadius: 3,
    opacity: 0.85,
  },
  historyMonthLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    marginTop: 4,
  },
  historyYearLabel: {
    fontSize: 10,
    color: "#95a5a6",
    marginTop: 2,
    fontWeight: "500",
  },
});
