import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: { padding: 20, flex: 1, backgroundColor: '#f5f7fa' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f7fa' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#2c3e50' },
    errorText: { fontSize: 18, color: 'red', textAlign: 'center', marginTop: 50 },
    
    section: {
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 10,
        color: '#3498db',
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
        paddingBottom: 5,
    },
    detail: { 
        fontSize: 16, 
        marginVertical: 4, 
        color: '#333',
    },
    
    chargeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    chargeDescription: {
        flex: 1,
        fontSize: 14,
        color: '#555',
    },
    chargeMontant: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
        marginLeft: 10,
    },
    finalSection: {
        borderLeftWidth: 5,
        borderLeftColor: '#2ecc71',
    },
    finalDetail: {
        fontSize: 16, 
        marginVertical: 3, 
        color: '#333',
    },
    soldeNote: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 10,
        width: '100%', 
        textAlign: 'center',
    },
    soldeNoteDebiteur: {
        color: '#c0392b', // Rouge pour celui qui doit
    },
    soldeNoteCrediteur: {
        color: '#27ae60', // Vert pour celui qui doit recevoir
    },
    soldeNoteEquilibre: {
        color: '#34495e',
    },
    chargePayeur: {
        fontSize: 12,
        color: '#7f8c8d',
        marginLeft: 10,
        fontWeight: 'bold',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 15,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#ecf0f1',
        flex: 1,
        flexWrap: 'wrap',
    },
    summaryLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#34495e',
        flexShrink: 1,
    },
    dettePayer: {
        fontSize: 16,
        fontWeight: '700',
        color: '#e74c3c',  
    },
    detteRecevoir: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2ecc71', 
    },
    detteEquilibre: {
        fontSize: 16,
        fontWeight: '700',
        color: '#3498db',
    },
    detteContainer: {
        marginTop: 10,
        width: '100%', 
    },
    regularisationSummary: {
        marginTop: 15,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#ecf0f1',
        width: '100%',
    },
    detteMessageBase: {
        fontSize: 16,
        fontWeight: '700',
    },

    regularisationNotePayer: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#34495e',
        marginTop: 5,
        textAlign: 'center',
    },
    regularisationNoteEquilibre: {
        fontSize: 15,
        color: '#7f8c8d',
        marginTop: 5,
        textAlign: 'center',
    },

    finalConclusionBlock: {
        width: '100%',
    },
    finalConclusionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#3498db',
        marginBottom: 5,
    },

    detailSeparator: {
        height: 1,
        backgroundColor: '#bdc3c7',
        width: '80%',
        alignSelf: 'center',
        marginVertical: 15,
    },
    soldeFinal: {
        fontSize: 24,
        fontWeight: '900',
        color: '#34495e',
        marginBottom: 10,
        textAlign: 'center',
    },
})