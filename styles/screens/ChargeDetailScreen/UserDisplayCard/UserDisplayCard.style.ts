import { StyleSheet } from "react-native";
import { colors } from "../../../theme.style";

export const styles = StyleSheet.create({

  // ── Textes ────────────────────────────────────
  userName: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  userCurrentTag: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
});