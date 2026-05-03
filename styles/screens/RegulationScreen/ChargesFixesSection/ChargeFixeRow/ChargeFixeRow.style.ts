import { StyleSheet } from "react-native";
import { colors, radius } from "../../../../../styles/theme.style";

export const styles = StyleSheet.create({

  // ── Ligne ─────────────────────────────────────
  chargeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    width: "100%",
  },

  // ── Inputs ────────────────────────────────────
  input: {
    padding: 8,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.neutral500,
    fontSize: 14,
    minWidth: 0,
  },
  descriptionInput: {
    flex: 6,
    marginRight: 8,
    backgroundColor: "#fcfcfc",
  },
  montantInput: {
    flex: 3,
    marginRight: 8,
  },

  // ── Suppression ───────────────────────────────
  deleteButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});