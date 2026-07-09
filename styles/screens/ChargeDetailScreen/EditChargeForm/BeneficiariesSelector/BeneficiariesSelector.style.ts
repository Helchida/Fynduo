import { StyleSheet } from "react-native";
import { colors, spacing } from "../../../../theme.style";

export const styles = StyleSheet.create({

  beneficiaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.neutral100,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },

  beneficiaryName: {
    color: "#000",
    fontSize: 16,
  },
  beneficiaryAmount: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: "#F1F3F5",
    borderRadius: 8,
    padding: 2,
  },
  modeButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  modeButtonActive: {
    backgroundColor: "#27ae60",
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  modeButtonTextActive: {
    color: "#fff",
  },

  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: "#eafaf1",
    borderWidth: 1,
    borderColor: "#a9e5c5",
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginBottom: 10,
    gap: 5,
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#27ae60",
  },

  errorText: {
    fontSize: 12,
    color: "#e74c3c",
    marginBottom: 8,
  },
  beneficiaryLabelZone: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  partInputsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  partInputTaux: {
    width: 44,
    textAlign: "right",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    fontSize: 13,
    paddingVertical: 2,
    fontWeight: "600",
    color: "#333",
  },
  partInputMontant: {
    width: 54,
    textAlign: "right",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    fontSize: 13,
    paddingVertical: 2,
    marginLeft: 8,
    fontWeight: "600",
    color: "#333",
  },
  partInputUnit: {
    fontSize: 12,
    color: "#333",
    fontWeight: "600",
  },
});