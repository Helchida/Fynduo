import { StyleSheet } from "react-native";
import { colors, spacing, radius, shadows, typography } from "./theme.style";

export const common = StyleSheet.create({
  // ── Inputs ────────────────────────────────────
  input: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md + 3,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.neutral200,
    marginBottom: spacing.xl,
    color: colors.textPrimary,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  selectorButton: {
    backgroundColor: colors.neutral100,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md - 2,
  },
  selectorLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },

  // ── Boutons principaux ────────────────────────
  addButton: {
    backgroundColor: colors.success,
    padding: 14,
    borderRadius: radius.sm,
    marginBottom: spacing.md + 3,
    alignItems: "center" as const,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonText: {
    color: colors.surface,
    fontWeight: "700",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: colors.success,
    padding: spacing.lg,
    borderRadius: radius.lg,
    alignItems: "center" as const,
    marginTop: spacing.xl,
    ...shadows.sm,
  },
  saveButtonText: {
    color: colors.surface,
    fontSize: 17,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: colors.textLight,
  },
  btnCancel: {
    flex: 1,
    padding: spacing.md + 3,
    borderRadius: radius.lg,
    alignItems: "center" as const,
    backgroundColor: colors.neutral100,
    marginTop: spacing.xl,
  },
  btnCancelText: {
    color: colors.textSecondary,
    fontWeight: "700",
  },
  btnConfirm: {
    flex: 2,
    padding: spacing.md + 3,
    borderRadius: radius.lg,
    alignItems: "center" as const,
    backgroundColor: colors.primary,
    marginTop: spacing.xl,
  },
  btnConfirmText: {
    color: colors.surface,
    fontWeight: "700",
  },
  modalButtons: {
    flexDirection: "row",
    gap: spacing.md + 3,
    marginTop: spacing.sm + 2,
  },

  // ── Modals ────────────────────────────────────
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    padding: spacing.xl,
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: spacing.xl,
    textAlign: "center",
  },
  modalItem: {
    paddingVertical: spacing.md + 3,
    paddingHorizontal: spacing.sm + 2,
  },
  modalItemSelected: {
    backgroundColor: "#e6f7ff",
    borderRadius: radius.xs,
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
  },
  modalCloseButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.textLight,
    padding: spacing.md + 3,
    borderRadius: radius.lg,
    alignItems: "center" as const,
  },
  modalCloseButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "bold",
  },

  // ── Séparateurs ───────────────────────────────
  separator: {
    height: 1,
    backgroundColor: colors.neutral600,
  },

  // ── Avatar badge ──────────────────────────────
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0f2f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: "#e1e4e8",
  },
  avatarText: {
    fontSize: 20,
  },

  // ── Typographie ───────────────────────────────
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    fontStyle: "italic",
    marginVertical: spacing.sm + 2,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: colors.primary,
  },

  // ── Formulaire section card ───────────────────
  formContainer: {
    backgroundColor: colors.surface,
    padding: spacing.lg + 2,
    borderRadius: radius.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: "#eee",
    ...shadows.xs,
  },
  editLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: spacing.sm,
    textTransform: "uppercase",
  },

  // ── User card / Payor card ────────────────────
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.md + 3,
    marginBottom: 1,
  },
  payorCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    marginBottom: spacing.sm + 2,
    marginTop: spacing.xs + 1,
    borderRadius: radius.sm,
    overflow: "hidden",
    elevation: 1,
  },
  cardAmount: {
    fontSize: 17,
    fontWeight: "600",
    minWidth: 70,
    textAlign: "right",
    color: "#333",
  },

  // ── Édition inline ────────────────────────────
  inputFieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    marginTop: spacing.xxs,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    minHeight: 48,
  },
  editInputActive: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    padding: 0,
  },

  // ── Utilitaires ───────────────────────────────
  bold: {
    fontWeight: "600",
  },

  // ── Épargne / Tirelire partagés ───────────────
  subTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#34495e",
  },
  subActions: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md + 3,
    marginTop: spacing.sm + 2,
    marginHorizontal: spacing.xl,
  },
  titleWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
  },
  priorityBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  priorityBadgeNormal: {
    backgroundColor: colors.neutral300,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.textSecondary,
  },
  dispatchButton: {
    backgroundColor: colors.surface,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.lg,
    gap: spacing.sm + 2,
    marginHorizontal: spacing.xs,
    flex: 1,
  },
  dispatchButtonText: {
    color: colors.surface,
    fontWeight: "800",
    fontSize: 16,
  },
  dispatchItem: {
    padding: spacing.md + 3,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    marginBottom: spacing.sm + 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
  dispatchItemName: {
    fontWeight: "700",
    color: colors.textPrimary,
  },
  dispatchItemReste: {
    fontSize: 12,
    color: colors.success,
    fontWeight: "600",
  },
  dispatchItemAuto: {
    backgroundColor: colors.warningBgAlt,
    borderColor: colors.warning,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  dispatchItemAutoContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  dispatchItemAutoText: {
    flex: 1,
    paddingRight: spacing.sm + 2,
  },
  dispatchItemAutoName: {
    color: colors.warning,
    fontWeight: "800",
  },
  dispatchItemAutoIcon: {
    opacity: 0.9,
  },
  breakInfoBox: {
    backgroundColor: colors.warningBg,
    padding: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.xl,
  },
  breakInfoText: {
    fontSize: 12,
    color: colors.warningText,
    textAlign: "center",
    fontStyle: "italic",
  },

  // ── Auth screens (Login / Register) ──────────
  authInnerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  authHeaderContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 40,
  },
  authLogo: {
    width: 400,
    height: 200,
  },
  authButton: {
    marginTop: spacing.sm + 2,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: "center" as const,
    backgroundColor: colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  authButtonText: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: "700",
    textTransform: "uppercase" as const,
  },

  // ── Layout scroll screens ─────────────────────
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  inputGroup: {
    marginBottom: spacing.md + 3,
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: spacing.xs + 1,
    fontWeight: "600",
  },

  // ── Container scroll générique light
  lightScreen: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },

  // ── Section card (ChargesFixesSection / ChargesSection / LoyerSection) ──
  cardFlat: {
    backgroundColor: colors.surface,
    padding: spacing.md + 3,
    borderRadius: radius.md,
    marginBottom: spacing.xl,
    ...shadows.md,
    shadowRadius: 3,
  },
  cardFlatTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: spacing.md + 3,
    color: colors.textPrimary,
  },

  // ── Detail screen (ChargeDetail / RevenuDetail) ────────────────────────
  detailContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  detailHeaderContainer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    marginBottom: spacing.md + 3,
  },
  iconText: {
    fontSize: 30,
    color: colors.surface,
  },
  detailTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginTop: spacing.xs + 1,
    textAlign: "center",
  },
  detailDateText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md + 3,
  },

  // ── Stats cards (ChargesStatsCard / RevenusStatsCard) ──────────────────
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing.xl,
  },
  legendWrapper: {
    marginTop: spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: colors.neutral100,
    paddingTop: spacing.xl,
    padding: spacing.xl,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  catName: { fontSize: 15, fontWeight: "600", color: "#2D3436" },
  catPercent: { fontSize: 12, color: "#A0A0A0", marginTop: spacing.xxs },
  catValue: { fontSize: 16, fontWeight: "700", color: "#2D3436" },
  indicator: { width: 20, height: 3, borderRadius: 2, marginTop: spacing.xs },
  totalAmount: { fontSize: 20, fontWeight: "bold", color: "#1A1A1A" },
  totalLabel: {
    fontSize: 10,
    color: "#95A5A6",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  focusedCategory: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: spacing.xs,
  },
  focusedAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6C757D",
    marginTop: spacing.xxs,
  },

  // ── Item ──────────────────────────────────────
  cashFlowItem: {
    backgroundColor: colors.surface,
    padding: spacing.md + 3,
    borderRadius: radius.lg,
    marginBottom: spacing.sm + 2,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 5,
    borderLeftColor: colors.successLight,
    ...shadows.md,
  },

  // ── Infos ─────────────────────────────────────
  cashFlowInfo: {
    flex: 1,
    justifyContent: "center",
  },
  cashFlowDesc: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  cashFlowPayer: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },

  // ── Montant ───────────────────────────────────
  cashFlowMontantContainer: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.xs,
    marginLeft: spacing.sm + 2,
  },
  cashFlowMontant: {
    fontSize: 17,
    fontWeight: "bold",
    color: colors.textPrimary,
  },

  // ── Modal centré (ConfirmModal / DatePickerModal) ────────────────────
  modalCenteredOverlay: {
    justifyContent: "center",
    alignItems: "center",
  },
  modalCenteredContainer: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
  },

  // ── Row ────────────────────
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});
