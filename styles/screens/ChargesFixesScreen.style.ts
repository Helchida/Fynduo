import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 20, 
        backgroundColor: '#f8f8f8'
    },
    header: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    warning: { 
        color: '#d9534f',
        backgroundColor: '#f2dede',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
        textAlign: 'center',
    },
    loading: { 
        textAlign: 'center', 
        marginTop: 50,
        fontSize: 18,
        color: '#5bc0de',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: { 
        flex: 1, 
    },
    listContent: {
        paddingBottom: 20,
    },
    addButton: { 
        backgroundColor: '#27ae60',
        padding: 14, 
        borderRadius: 8, 
        marginBottom: 15, 
        alignItems: 'center',
        shadowColor: '#27ae60',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    addButtonText: { 
        color: '#fff', 
        fontWeight: '700',
        fontSize: 16,
    },
    disabledButton: {
        backgroundColor: '#bdc3c7',
    },
    formContainer: { 
        backgroundColor: '#fff', 
        padding: 18, 
        borderRadius: 12, 
        marginBottom: 20, 
        borderWidth: 1, 
        borderColor: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    input: { 
        borderWidth: 1, 
        borderColor: '#ddd', 
        padding: 12, 
        marginBottom: 15, 
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        color: '#555',
        marginBottom: 5,
        fontWeight: '600',
    },
    dropdownInput: {
        justifyContent: 'center', 
        minHeight: 48,
        paddingVertical: 12,
    },
    inputText: {
        fontSize: 16,
        color: '#333',
    },
    placeholderText: {
        fontSize: 16,
        color: '#999',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        padding: 20,
        maxHeight: '60%', 
    },
    modalHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#333',
    },
    modalItem: {
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    modalItemSelected: {
        backgroundColor: '#e6f7ff',
        borderRadius: 5,
    },
    modalItemText: {
        fontSize: 16,
        color: '#333',
    },
    separator: {
        height: 1,
        backgroundColor: '#f0f0f0',
    },
    modalCloseButton: {
        marginTop: 20,
        backgroundColor: '#bdc3c7',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    modalCloseButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    payeurInfo: { 
        marginBottom: 15, 
        fontStyle: 'italic', 
        fontSize: 14,
        color: '#7f8c8d',
    },
});