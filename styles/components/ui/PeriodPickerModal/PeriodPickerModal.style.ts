import { StyleSheet, Dimensions } from "react-native";
import { colors, spacing, radius, shadows } from "../../../../styles/theme.style";

const { height } = Dimensions.get("window");

export const styles = StyleSheet.create({

  // ── Modal ─────────────────────────────────────
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingTop: spacing.xl,
    maxHeight: height * 0.8,
  },

  // ── Header ────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    color: "#007AFF",
    fontSize: 16,
  },

  // ── Tab bar ───────────────────────────────────
  tabBar: {
    flexDirection: "row",
    marginHorizontal: spacing.xl,
    backgroundColor: colors.neutral100,
    borderRadius: radius.md,
    padding: spacing.xxs,
    marginBottom: spacing.md + 3,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: radius.sm,
  },
  activeTab: {
    backgroundColor: colors.surface,
    ...shadows.xs,
    shadowOffset: { width: 0, height: 1 },
  },
  tabText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#000",
  },

  // ── Items ─────────────────────────────────────
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 40,
  },
  item: {
    paddingVertical: spacing.md + 3,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  selectedItem: {
    backgroundColor: colors.neutral100,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.sm,
  },
  itemText: { fontSize: 16 },
  selectedItemText: { color: "#007AFF", fontWeight: "600" },
});