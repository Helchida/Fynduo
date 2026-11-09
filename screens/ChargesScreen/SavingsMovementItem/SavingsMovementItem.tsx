import React from "react";
import { View, Text } from "react-native";
import { common } from "../../../styles/common.style";
import { styles } from "../../../styles/screens/ChargesScreen/SavingsMovementItem/SavingsMovementItem.style";

interface SavingsMovementItemProps {
  movement: {
    id: string;
    description: string;
    montantTotal: number;
  };
}

const SavingsMovementItem: React.FC<SavingsMovementItemProps> = ({
  movement,
}) => {
  return (
    <View style={[common.cashFlowItem, styles.container]}>
      <View style={[common.avatarBadge]}>
        <Text style={common.avatarText}>🏦</Text>
      </View>

      <View style={common.cashFlowInfo}>
        <Text style={common.cashFlowDesc}>{movement.description}</Text>
        <Text style={[common.cashFlowPayer, styles.subText]}>
          Placement épargne
        </Text>
      </View>

      <View style={common.cashFlowMontantContainer}>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>ÉPARGNE</Text>
        </View>
        <Text style={[common.cashFlowMontant]}>
          {movement.montantTotal.toFixed(2)} €
        </Text>
      </View>
    </View>
  );
};

export default SavingsMovementItem;
