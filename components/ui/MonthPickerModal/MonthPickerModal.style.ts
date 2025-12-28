import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 20,
        width: "80%",
        maxHeight: "70%",
    },
    modalHeader: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    modalItem: {
        padding: 16,
        borderRadius: 8,
    },
    modalItemSelected: {
        backgroundColor: "#3498db",
    },
    modalItemText: {
        fontSize: 16,
        color: "#333",
    },
    modalItemTextSelected: {
        color: "white",
        fontWeight: "600",
    },
    separator: {
        height: 1,
        backgroundColor: "#eee",
    },
    modalCloseButton: {
        marginTop: 16,
        padding: 12,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        alignItems: "center",
    },
    modalCloseButtonText: {
        fontSize: 16,
        color: "#333",
        fontWeight: "600",
    },
});