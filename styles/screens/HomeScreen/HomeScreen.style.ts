import { StyleSheet, Dimensions } from "react-native";
import { colors, spacing, radius, shadows, typography } from "../../theme.style";
import { common } from "../../common.style";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({

  // ── Layouts ───────────────────────────────────
  mainView: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.md + 3,
    paddingTop: spacing.sm + 2,
  },

  // ── Header ────────────────────────────────────
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md + 3,
    paddingBottom: spacing.xl,
    backgroundColor: colors.backgroundAlt,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginRight: spacing.xs
  },
  userIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.md,
  },

  // ── Badges ────────────────────────────────────
  badge: {
    marginTop: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    alignSelf: "flex-start",
  },
  badgeSolo: {
    backgroundColor: colors.badgeSoloBg,
  },
  badgeShared: {
    backgroundColor: colors.primaryLight,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  badgeTextSolo: {
    color: colors.badgeSoloText,
  },
  badgeTextShared: {
    color: "#1e88e5",
  },

  // ── Titres de section ─────────────────────────
  sectionTitle: {
    ...typography.h3,
    marginBottom: 30,
    textAlign: "center",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  sectionTitleHeader: {
    ...typography.h3,
  },

  // ── Loading ───────────────────────────────────
  loading: {
    ...common.loadingText,
    fontSize: 18,
  },

  // ── Historique / Chart ────────────────────────
  historyCard: {
    backgroundColor: colors.surface,
    padding: spacing.sm + 2,
    borderRadius: radius.xl,
    marginBottom: spacing.xl,
    ...shadows.lg,
    shadowOffset: { width: 0, height: 4 },
  },
  historyNavigator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 150,
  },
  navArrow: {
    padding: spacing.sm + 2,
    opacity: 0.6,
  },
  navArrowText: {
    fontSize: 28,
    fontWeight: "200",
    color: colors.primary,
  },
  navArrowDisabled: {
    opacity: 0.3,
  },
  navArrowTextDisabled: {
    color: colors.textLight,
  },
  chartArea: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: "100%",
    paddingTop: 45,
  },
  historyTotalLabel: {
    fontWeight: "700",
    marginBottom: spacing.xs,
    textAlign: "center",
  },

  // ── Switch période ────────────────────────────
  switchContainer: {
    flexDirection: "row",
    backgroundColor: colors.neutral100,
    borderRadius: radius.full,
    padding: spacing.xxs,
    borderWidth: 1,
    borderColor: colors.neutral400,
  },
  switchButton: {
    paddingVertical: spacing.xs + 1,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.xl + 3,
  },
  switchButtonActive: {
    backgroundColor: colors.surface,
    ...shadows.xs,
    shadowOffset: { width: 0, height: 1 },
  },
  switchText: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.textMuted,
  },
  switchTextActive: {
    color: colors.primary,
  },

  // ── Actions rapides ───────────────────────────
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: spacing.xl,
  },
  actionButton: {
    backgroundColor: colors.surface,
    padding: spacing.lg + 2,
    borderRadius: radius.lg,
    width: "48%",
    marginBottom: spacing.md + 3,
    alignItems: "center",
    justifyContent: "center",
    minHeight: width * 0.25,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    ...shadows.xs,
  },
  actionText: {
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    fontSize: 15,
  },

  // ── Solo info card ────────────────────────────
  soloInfoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginTop: spacing.xl,
    alignItems: "center",
    ...shadows.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  soloTitle: {
    ...typography.h3,
    marginBottom: spacing.sm + 2,
  },
  soloDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  inviteButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl + 1,
    borderRadius: radius.full,
  },
  inviteButtonText: {
    color: colors.surface,
    fontWeight: "600",
    fontSize: 15,
  },

  // ── Menu dropdown (user) ──────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  menuDropdown: {
    position: "absolute",
    top: 60,
    right: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    width: 180,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral600,
    ...shadows.xl,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm + 2,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },

  // ── Menu dropdown (household) ─────────────────
  householdMenuDropdown: {
    position: "absolute",
    top: 100,
    left: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    width: 220,
    padding: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.neutral600,
    zIndex: 1000,
    ...shadows.xl,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 12,
  },
  householdMenuTitle: {
    ...typography.label,
    color: colors.textLight,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm + 2,
  },
  householdItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  activeHouseholdItem: {
    backgroundColor: colors.primaryBg,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  householdItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    flex: 1,
  },
  activeHouseholdText: {
    color: colors.primary,
    fontWeight: "700",
  },
  addHouseholdItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm + 2,
    marginTop: spacing.xs + 1,
    borderTopWidth: 1,
    borderTopColor: colors.neutral600,
  },
  addHouseholdText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
});