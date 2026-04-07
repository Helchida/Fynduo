import { StyleSheet } from "react-native";

// Couleurs spécifiques aux badges — non présentes dans theme car usage unique
export const styles = StyleSheet.create({

  // ── Layout ────────────────────────────────────
  container: {
    flexDirection: "row",
    gap: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  // ── Variantes ─────────────────────────────────
  soloBadge:     { backgroundColor: "#ebf5ff", borderColor: "#badbff" },
  soloBadgeText: { color: "#3182ce" },

  sharedBadge:     { backgroundColor: "#fef9c3", borderColor: "#fde047" },
  sharedBadgeText: { color: "#854d0e" },

  fixedBadge:     { backgroundColor: "#fee2e2", borderColor: "#fecaca" },
  fixedBadgeText: { color: "#b91c1c" },

  variableBadge:     { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" },
  variableBadgeText: { color: "#15803d" },
});