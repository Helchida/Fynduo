import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
chargeItem: {
        padding: 15,
        marginBottom: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderLeftWidth: 5,
        borderLeftColor: '#d14127ff',
        shadowColor: "#000",
        shadowOffset: {
        width: 0,
        height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.00,
        elevation: 1,
    },
    chargeName: { 
        fontSize: 18, 
        fontWeight: '700',
        color: '#2c3e50',
    },
    chargePayer: { 
        fontSize: 14, 
        color: '#7f8c8d', 
        marginBottom: 8 
    },
    payeurContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        marginBottom: 8,
        marginTop: 8,
        backgroundColor: '#ecf0f1',
        borderRadius: 5,
    },
    payeurLabel: {
        fontSize: 14, 
        color: '#7f8c8d', 
        fontWeight: 'bold',
        marginRight: 5,
    },
    payeurName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3498db',
        textDecorationLine: 'underline',
    },
    
    inputRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginTop: 5 
    },
    currency: { 
        fontSize: 18, 
        marginRight: 5,
        fontWeight: 'bold',
        color: '#27ae60',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#bdc3c7',
        padding: 10,
        marginRight: 10,
        borderRadius: 6,
        backgroundColor: '#ecf0f1',
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: '#2ecc71',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    disabledButton: {
        backgroundColor: '#bdc3c7',
        opacity: 0.7,
    },
    deleteButton: {
        backgroundColor: '#e74c3c',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 'auto',
    },
    deleteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
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
})