import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
});