import React from 'react';
import { View, Text } from 'react-native';
import dayjs from 'dayjs';
import { styles } from './ChargeVariableItem.style';
import { ChargeVariableItemProps } from './ChargeVariableItem.type';
import { useGetDisplayNameUserInHousehold } from 'hooks/useGetDisplayNameUserInHousehold';


const ChargeVariableItem: React.FC<ChargeVariableItemProps> = React.memo(({ charge, householdUsers }) => {

    const payeurName = useGetDisplayNameUserInHousehold(charge.payeur, householdUsers);

    const benefCount = charge.beneficiaires.length;
    let shareText = '';
    if (benefCount === 0) {
        shareText = 'personne';
    } else if (benefCount === 1) {
        shareText = useGetDisplayNameUserInHousehold(charge.beneficiaires[0], householdUsers);
    } else if (benefCount > 1) {
        shareText = `${benefCount} personnes`;
    }

    const partParPersonne = benefCount > 0 ? charge.montantTotal / benefCount : charge.montantTotal;

    return (
        <View style={styles.depenseItem}>
            <View style={styles.depenseInfo}>
                <Text style={styles.depenseDesc}>{charge.description}</Text>
                <Text style={styles.depenseDate}>{dayjs(charge.date).format('DD MMM à HH:mm')}</Text>
            </View>
            <View style={styles.depenseDetails}>
                <Text style={styles.depenseAmount}>
                    {charge.montantTotal.toFixed(2)} €
                </Text>
                <Text style={styles.depensePayer}>
                    Payé par {payeurName} | Part: {partParPersonne.toFixed(2)} € sur {shareText}
                </Text>
            </View>
        </View>
    );
});

export default ChargeVariableItem