import { StyleSheet } from "react-native";
import { colors, spacing, radius, shadows } from "../../theme.style";

export const styles = StyleSheet.create({

  // ── Layout ────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Header actions ────────────────────────────
  headerActions: {
    flexDirection: "row",
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.successLight,
    padding: 14,
    borderRadius: radius.lg,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
    ...shadows.md,
  },
  joinButton: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    color: colors.surface,
    fontWeight: "700",
    fontSize: 14,
  },

  // ── Items household ───────────────────────────
  householdItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm + 2,
    borderWidth: 1,
    borderColor: "#eee",
  },
  activeHouseholdItem: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primary,
    borderLeftWidth: 4,
  },
  householdItemText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    flex: 1,
  },
  activeHouseholdText: {
    color: colors.primary,
    fontWeight: "700",
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  iconPadding: {
    padding: spacing.sm + 2,
    borderRadius: radius.sm,
  },

  // ── Modal ─────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.surface,
    width: "100%",
    maxWidth: 400,
    padding: spacing.xxl,
    borderRadius: radius.xxl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: spacing.xl,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: colors.neutral500,
    padding: spacing.md + 3,
    borderRadius: radius.md,
    fontSize: 16,
    marginBottom: 25,
    color: colors.textPrimary,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 25,
  },
  cancelText: {
    color: colors.textMuted,
    fontWeight: "600",
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: 25,
    borderRadius: radius.md,
    minWidth: 100,
    alignItems: "center",
  },
  confirmButtonText: {
    color: colors.surface,
    fontWeight: "bold",
    fontSize: 16,
  },
});