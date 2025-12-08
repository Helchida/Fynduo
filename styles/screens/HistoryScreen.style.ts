import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    // --- Conteneurs généraux ---
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa', // Fond légèrement gris
        paddingHorizontal: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f7fa',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#7f8c8d',
        textAlign: 'center',
    },

    // --- Titre ---
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50', // Couleur principale foncée
        paddingVertical: 15,
        paddingHorizontal: 10,
        marginBottom: 5,
    },

    // --- Carte de Mois ---
    monthCard: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 15,
        marginVertical: 8,
        marginHorizontal: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3, // Android shadow
        borderLeftWidth: 5,
        borderLeftColor: '#3498db', // Bande bleue pour l'historique
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        flex: 2, // Prend plus d'espace
    },
    
    // --- Badge de Statut ---
    statusBadge: {
        backgroundColor: '#2ecc71', // Vert pour 'Clôturé'
        color: '#ffffff',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 15,
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        marginHorizontal: 10,
    },

    // --- Texte de détail (Flèche) ---
    detailText: {
        fontSize: 16,
        color: '#3498db', // Bleu pour l'action
        fontWeight: '500',
    },
});