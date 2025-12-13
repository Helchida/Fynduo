import React from 'react';
import { View, Text } from 'react-native';
import { IChargeVariable, IUser } from '../../types';
import dayjs from 'dayjs';
import { styles } from '../../styles/components/fynduo/ChargeVariableItem.style';

interface ChargeVariableItemProps {
    charge: IChargeVariable;
    householdUsers: IUser[];
}

const getDisplayNames = (uids: string[], users: IUser[]): string => {
    // Crée une Map d'accès rapide UID -> Nom d'affichage
    const userMap = new Map(users.map(u => [u.id, u.displayName]));

    const names = uids
        .map(uid => userMap.get(uid) ?? uid) // Récupère le nom ou l'UID si non trouvé
        .filter((name): name is string => typeof name === 'string'); // S'assure que l'on n'a pas de undefined/null

    if (names.length === 0) return "Aucun";
    if (names.length === users.length) return "Tout le foyer";
    
    // Affiche les deux premiers noms + le compte si plus de deux
    const displayNames = names.slice(0, 2).join(', ');
    return displayNames + (names.length > 2 ? ` et ${names.length - 2} autres` : '');
};

const ChargeItem: React.FC<ChargeVariableItemProps> = React.memo(({ charge, householdUsers }) => {
    
    // Obtient le nom du payeur à partir de l'UID
    // On utilise payeurDisplayName si stocké (pour une performance optimale)
    const payeurName = getDisplayNames([charge.payeur], householdUsers);
    
    // Obtient la liste des bénéficiaires
    const beneficiairesList = getDisplayNames(charge.beneficiaires, householdUsers);
    
    // Calcule la part par bénéficiaire (pour l'affichage)
    const partParPersonne = charge.montantTotal / charge.beneficiaires.length;

    return (
        <View style={styles.depenseItem}>
            <View style={styles.depenseInfo}>
                <Text style={styles.depenseDesc}>{charge.description}</Text>
                {/* 💡 Affichage de la part par personne (si plus d'un bénéficiaire) */}
                {charge.beneficiaires.length > 1 && (
                    <Text style={styles.depensePart}>
                        Part: {partParPersonne.toFixed(2)} €/pers
                    </Text>
                )}
                <Text style={styles.depenseDate}>{dayjs(charge.date).format('DD MMM à HH:mm')}</Text>
            </View>
            
            <View style={styles.depenseDetails}>
                <Text style={styles.depenseAmount}>
                    {charge.montantTotal.toFixed(2)} €
                </Text>
                
                {/* 💡 Affichage du payeur (avec le nom lisible) */}
                <Text style={styles.depensePayer}>Payé par {payeurName}</Text>
                
                {/* 💡 Affichage des bénéficiaires */}
                <Text style={styles.depenseBeneficiaires}>Pour {beneficiairesList}</Text>
            </View>
        </View>
    );
});

export default ChargeItem