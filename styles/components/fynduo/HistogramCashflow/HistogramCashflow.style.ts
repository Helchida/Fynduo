import { StyleSheet } from "react-native";
import { colors } from "../../../../styles/theme.style";

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
    color: colors.textSecondary,
    marginTop: 4,
  },
  historyYearLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: "500",
  },
});