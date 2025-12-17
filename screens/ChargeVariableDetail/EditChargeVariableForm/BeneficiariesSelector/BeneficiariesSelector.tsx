import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './BeneficiariesSelector.style';
import { BeneficiariesSelectorProps } from './BeneficiariesSelector.type';

export const BeneficiariesSelector = ({ users, selectedUids, totalAmount, onToggle, getDisplayName, currentUserId }: BeneficiariesSelectorProps) => {
  const amountNum = parseFloat(totalAmount.replace(",", ".")) || 0;

  return (
    <View style={[styles.editSectionCard, styles.payorCard]}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 15 }}>
        <Text style={styles.editLabel}>Diviser</Text>
        <Text style={[styles.editLabel, { color: "#27ae60" }]}>Également</Text>
      </View>

      {users.map((u) => {
        const isSelected = selectedUids.includes(u.id);
        const share = isSelected ? (amountNum / (selectedUids.length || 1)).toFixed(2) : "0,00";

        return (
          <TouchableOpacity key={u.id} style={styles.beneficiaryRow} onPress={() => onToggle(u.id)}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                {isSelected && <Text style={{ color: "#fff", fontSize: 10 }}>✓</Text>}
              </View>
              <Text style={[styles.beneficiaryName, !isSelected && { color: "#666" }]}>
                {getDisplayName(u.id)} {u.id === currentUserId ? "(Moi)" : ""}
              </Text>
            </View>
            <Text style={[styles.beneficiaryAmount, !isSelected && { color: "#666" }]}>
              {share.replace(".", ",")} €
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};