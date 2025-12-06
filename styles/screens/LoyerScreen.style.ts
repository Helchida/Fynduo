import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f8f8f8'
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: { 
        fontSize: 24,
        fontWeight: 'bold', 
        marginBottom: 25,
        color: '#333',
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: { 
        fontSize: 16, 
        marginBottom: 5, 
        fontWeight: '600',
        color: '#555',
    },
    input: {
        borderWidth: 1,
        borderColor: '#bdc3c7',
        padding: 10,
        fontSize: 16,
        borderRadius: 8,
        backgroundColor: '#fff',
        color: '#34495e',
    },
    resultContainer: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#ecf0f1',
        borderRadius: 8,
        borderLeftWidth: 5,
        borderLeftColor: '#3498db',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    resultLabel: {
        fontSize: 16,
        color: '#34495e',
        fontWeight: '600',
    },
    resultValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2980b9',
    },
    loading: { 
        textAlign: 'center', 
        marginTop: 50,
        fontSize: 18,
        color: '#5bc0de',
    },
    validationContainer: {
        marginTop: 30,
    },
    validationButton: { 
        backgroundColor: '#2ecc71',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
        shadowColor: "#2ecc71",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    validationButtonText: { 
        color: '#fff', 
        fontWeight: '700',
        fontSize: 18,
    },
    disabledButton: {
        backgroundColor: '#bdc3c7',
        shadowOpacity: 0.1,
        elevation: 2,
    },
});