import { StyleSheet } from "react-native";
import {
  colors,
  spacing,
  radius,
  shadows,
  typography,
} from "../../../theme.style";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: spacing.md + 3,
    borderRadius: radius.lg,
    marginBottom: spacing.sm + 2,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 5,
    borderLeftColor: "#F39C12",
    ...shadows.md,
  },

  subText: {
    color: "#D68910",
  },
  badgeContainer: {
    backgroundColor: "#FDEBD0",
    borderColor: "#f39d1252",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-end",
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#B9770E",
  },
});
