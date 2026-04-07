import { StyleSheet } from "react-native";
import { colors, spacing } from "../../../../styles/theme.style";

export const styles = StyleSheet.create({

  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.textLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md + 3,
  },
  avatarText: {
    color: colors.surface,
    fontWeight: "bold",
    fontSize: 18,
  },
});