import { Platform } from "react-native";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    top: Platform.OS === "web" ? 20 : 60,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
    pointerEvents: "box-none",
  },
});
