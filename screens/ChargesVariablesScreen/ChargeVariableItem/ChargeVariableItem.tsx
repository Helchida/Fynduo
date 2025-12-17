import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "./ChargeVariableItem.style";
import { ChargeVariableItemProps } from "./ChargeVariableItem.type";
import { useGetDisplayNameUserInHousehold } from "hooks/useGetDisplayNameUserInHousehold";

const ChargeVariableItem: React.FC<ChargeVariableItemProps> = ({
  charge,
  householdUsers,
  onPress,
}) => {
  const payeurName = useGetDisplayNameUserInHousehold(
    charge.payeur,
    householdUsers
  );

  return (
    <TouchableOpacity style={styles.depenseItem} onPress={() => onPress(charge)}>
      <View style={styles.depenseInfo}>
        <Text style={styles.depenseDesc}>{charge.description}</Text>
        <Text style={styles.depensePayer}>
          Payé par {payeurName}
        </Text>
      </View>
      <View style={styles.depenseDetails}>
        <Text style={styles.depenseAmount}>
          {charge.montantTotal.toFixed(2)} €
        </Text>
        
      </View>
    </TouchableOpacity>
  );
};

export default ChargeVariableItem;
