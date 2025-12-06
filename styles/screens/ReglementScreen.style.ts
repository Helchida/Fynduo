import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f4f4',
    },
    container: { 
        flex: 1, 
        backgroundColor: '#f4f4f4',
    },
    contentContainer: {
        padding: 15,
        paddingBottom: 40,
    },
    statusBadge: {
        backgroundColor: '#f39c12',
        padding: 10,
        borderRadius: 8,
        marginBottom: 20,
        alignItems: 'center',
    },
    statusText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    section: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    sectionTitle: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        marginBottom: 15, 
        color: '#2c3e50',
    },
    
    inputGroup: {
        marginBottom: 10,
    },
    inputLabel: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 5,
    },
    mainInput: {
        backgroundColor: '#ecf0f1',
        padding: 10,
        borderRadius: 5,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#bdc3c7',
    },
    
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    inputGroupHalf: {
        width: '48%',
    },
    
    subSection: {
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#3498db',
    },
    subSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    subSectionTitle: {
        fontWeight: '600',
        fontSize: 15,
        color: '#3498db',
    },
    chargeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    descriptionInput: {
        flex: 2,
        marginRight: 8,
        backgroundColor: '#fcfcfc', 
    },
    montantInput: {
        flex: 1,
        marginRight: 8,
    },
    input: {
        padding: 8,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 14,
    },
    addButton: {
        backgroundColor: '#2ecc71',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    deleteButton: {
        backgroundColor: '#e74c3c',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 5,
    },
    deleteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },

    validationContainer: {
        marginTop: 20,
        marginBottom: 40,
    }
});