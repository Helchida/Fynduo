import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 20, 
        backgroundColor: '#f4f7f9'
    },
    header: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: '#2c3e50',
        marginBottom: 20, 
        textAlign: 'center',
    },
    loading: { 
        textAlign: 'center', 
        marginTop: 50,
        fontSize: 16,
        color: '#7f8c8d',
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
    
    // --- NOUVEAUX STYLES POUR LES SÉLECTEURS ET INPUTS DU FORMULAIRE ---
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        color: '#2c3e50',
        fontWeight: '600',
        marginBottom: 5,
    },
    input: { 
        borderWidth: 1, 
        borderColor: '#ddd', 
        padding: 12, 
        marginBottom: 5, // Réduit si suivi par payeurInfo
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
    },
    dropdownInput: {
        justifyContent: 'center',
        minHeight: 48, // Assurer une hauteur cliquable
    },
    inputText: {
        fontSize: 16,
        color: '#2c3e50',
    },
    placeholderText: {
        fontSize: 16,
        color: '#95a5a6',
    },
    // --- FIN DES NOUVEAUX STYLES INPUTS ---

    payeurInfo: { 
        marginBottom: 15, 
        fontStyle: 'italic', 
        fontSize: 14,
        color: '#7f8c8d',
    },
    
    list: { 
        flex: 1,
        paddingBottom: 20,
    },

    // --- STYLES DES MODALS (Réutilisés de ChargeFixeItem.style.ts) ---
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end', 
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Légèrement plus sombre pour le modal
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        padding: 20,
        maxHeight: '70%', 
    },
    modalHeader: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#333',
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    modalItemSelected: {
        backgroundColor: '#e6f7ff', // Bleu très clair pour la sélection
    },
    modalItemText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    separator: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginHorizontal: 10,
    },
    modalCloseButton: {
        marginTop: 20,
        backgroundColor: '#bdc3c7',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalCloseButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});