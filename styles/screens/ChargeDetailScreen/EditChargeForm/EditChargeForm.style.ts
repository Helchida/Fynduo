import { StyleSheet } from "react-native";
import { colors, spacing, radius } from "../../../theme.style";

export const styles = StyleSheet.create({

  // ── Layout ────────────────────────────────────
  editFormContainer: {
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  editRow: {
    flexDirection: "row",
    marginBottom: 0,
  },

  // ── Sélecteur ─────────────────────────────────
  selectorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm + 2,
    height: 45,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  miniUserText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "500",
  },
});