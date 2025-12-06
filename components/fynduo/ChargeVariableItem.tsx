import React from 'react';
import { View, Text } from 'react-native';
import { IChargeVariable } from '../../types';
import dayjs from 'dayjs';
import { styles } from '../../styles/components/fynduo/ChargeVariableItem.style';

interface ChargeVariableItemProps {
    charge: IChargeVariable;
}

const ChargeItem: React.FC<ChargeVariableItemProps> = React.memo(({ charge }) => (
    <View style={styles.depenseItem}>
        <View style={styles.depenseInfo}>
            <Text style={styles.depenseDesc}>{charge.description}</Text>
            <Text style={styles.depenseDate}>{dayjs(charge.date).format('DD MMM à HH:mm')}</Text>
        </View>
        <View style={styles.depenseDetails}>
            <Text style={styles.depenseAmount}>
                {charge.montantTotal.toFixed(2)} €
            </Text>
            <Text style={styles.depensePayer}>Payé par {charge.payeur}</Text>
        </View>
    </View>
));

export default ChargeItem