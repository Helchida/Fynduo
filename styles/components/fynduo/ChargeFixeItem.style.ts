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
})