import { Platform, StyleSheet } from "react-native";
import { colors, spacing, radius, shadows } from "../../../styles/theme.style";

export const styles = StyleSheet.create({

  // ── Layout ────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    padding: spacing.xl,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: spacing.xl,
    textAlign: "left",
  },

  // ── Tabs ──────────────────────────────────────
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E9ECEF",
    borderRadius: 14,
    padding: spacing.xs,
    marginBottom: spacing.xl,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: "center",
    borderRadius: 11,
  },
  activeTab: {
    backgroundColor: colors.surface,
    elevation: 3,
    ...Platform.select({
      web: { boxShadow: "0px 2px 4px rgba(0,0,0,0.1)" },
      default: { ...shadows.md },
    }),
  },
  tabText: { fontWeight: "600", color: "#6C757D", fontSize: 14 },
  activeTabText: { color: "#007AFF" },

  // ── Sélecteur de mois ─────────────────────────
  monthSelector: { marginBottom: spacing.xl },
  monthScrollContent: { paddingHorizontal: spacing.xs },
  monthButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    marginHorizontal: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: "#E9ECEF",
  },
  monthButtonActive: {
    backgroundColor: "#007AFF",
    elevation: 2,
    ...Platform.select({
      web: { boxShadow: "0px 2px 6px rgba(0,122,255,0.3)" },
      default: {
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
    }),
  },
  monthButtonText: { fontSize: 14, fontWeight: "600", color: "#6C757D" },
  monthButtonTextActive: { color: colors.surface },

  // ── Sélecteur d'année ─────────────────────────
  yearSelector: { marginBottom: spacing.xl },
  yearButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  yearButton: {
    paddingHorizontal: 24,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: "#E9ECEF",
    minWidth: 80,
    alignItems: "center",
  },
  yearButtonActive: {
    backgroundColor: "#007AFF",
    elevation: 2,
    ...Platform.select({
      web: { boxShadow: "0px 2px 6px rgba(0,122,255,0.3)" },
      default: {
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
    }),
  },
  yearButtonText: { fontSize: 16, fontWeight: "700", color: "#6C757D" },
  yearButtonTextActive: { color: colors.surface },

  // ── Bouton période ────────────────────────────
  periodButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: spacing.xl,
    elevation: 2,
    ...Platform.select({
      web: { boxShadow: "0px 2px 4px rgba(0,0,0,0.08)" },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
    }),
  },
  periodButtonText: { fontSize: 16, fontWeight: "600", color: "#1A1A1A" },
  periodButtonIcon: { fontSize: 12, color: "#007AFF" },

  // ── Icône de charge ───────────────────────────
  chargeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f2f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: "#e1e4e8",
  },
  chargeIcon: { fontSize: 18 },

  // ── Header avec trigger ───────────────────────
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    gap: spacing.xs + 2,
    elevation: 2,
    ...Platform.select({
      web: { boxShadow: "0px 2px 4px rgba(0,0,0,0.08)" },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
    }),
  },
  triggerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    lineHeight: Platform.OS === "ios" ? 0 : 20,
    textAlignVertical: "center",
  },
  triggerChevron: { color: "#007AFF" },

  // ── Menu dropdown ─────────────────────────────
  modalBackdrop: { flex: 1 },
  menu: {
    position: "absolute",
    backgroundColor: colors.surface,
    borderRadius: 14,
    overflow: "hidden",
    minWidth: 160,
    elevation: 8,
    ...Platform.select({
      web: { boxShadow: "0px 4px 16px rgba(0,0,0,0.12)" },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
    }),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  menuItemActive: { backgroundColor: "#F0F7FF" },
  menuItemText: { fontSize: 14, fontWeight: "600", color: "#2D3436" },
  menuItemTextActive: { color: "#007AFF" },
  checkmark: { fontSize: 14, color: "#007AFF", fontWeight: "700" },
});