import { StyleSheet } from "react-native";
import { spacing } from "../../../../styles/theme.style";

export const styles = StyleSheet.create({
  modalHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xs + 1,
  },
});