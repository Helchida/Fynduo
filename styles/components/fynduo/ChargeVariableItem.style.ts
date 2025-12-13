import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    depenseItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderLeftWidth: 5,
        borderLeftColor: '#2ecc71',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    
    depenseInfo: { 
        flex: 3,
        // Aligner les infos à gauche
        alignItems: 'flex-start', 
    },
    depenseDetails: { 
        flex: 2, 
        alignItems: 'flex-end',
        // Ajouter de l'espace pour que le texte ne soit pas trop collé
        paddingLeft: 10, 
    },
    
    depenseDesc: { 
        fontSize: 17, 
        fontWeight: '600', 
        color: '#333',
        marginBottom: 5, // Ajout d'une petite marge
    },
    
    // NOUVEAU STYLE : Affichage de la part par personne
    depensePart: {
        fontSize: 13,
        color: '#2c3e50', // Couleur neutre/foncée
        fontStyle: 'italic',
        marginTop: 2,
    },

    depenseDate: { 
        fontSize: 12, 
        color: '#95a5a6', 
        marginTop: 5, // Plus de marge avec les nouvelles infos
    },
    
    depenseAmount: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#e67e22',
        marginBottom: 5, // Marge avant les infos payeur
    },
    
    depensePayer: { 
        fontSize: 13, 
        color: '#27ae60', 
        marginTop: 3, 
        fontWeight: '500',
    },

    // NOUVEAU STYLE : Affichage des bénéficiaires
    depenseBeneficiaires: {
        fontSize: 12, 
        color: '#7f8c8d', // Couleur plus discrète
        marginTop: 2,
        maxWidth: 150, // Limiter la largeur si les noms sont longs
    },
})