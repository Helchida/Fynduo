import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { IChargeFixe } from '../../types';
import { styles } from '../../styles/components/fynduo/ChargeFixeItem.style';

interface ChargeItemProps {
  charge: IChargeFixe;
  onUpdate: (id: string, newAmount: number) => Promise<void>;
}

const ChargeFixeItem: React.FC<ChargeItemProps> = ({ charge, onUpdate }) => {
  const [amount, setAmount] = useState(charge.montantMensuel.toString());
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    const newAmount = parseFloat(amount);
    
    if (isNaN(newAmount) || newAmount < 0) {
      Alert.alert("Erreur", "Le montant doit être un nombre positif.");
      return;
    }
    
    if (newAmount !== charge.montantMensuel) {
            setIsSaving(true);
            try {
                await onUpdate(charge.id, newAmount); 
            } catch (error) {
            } finally {
                setIsSaving(false);
            }
        }
  }, [amount, charge.montantMensuel, charge.id, onUpdate]);

  const isButtonDisabled = parseFloat(amount) === charge.montantMensuel || isSaving;

  return (
    <View style={styles.chargeItem}>
      <Text style={styles.chargeName}>{charge.nom}</Text>
      <Text style={styles.chargePayer}>Payé par: {charge.payeur}</Text>
      
      <View style={styles.inputRow}>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          editable={!isSaving}
          style={[styles.input, { backgroundColor: '#f5f5f5', color: '#999' }]}
        />
        <Text style={styles.currency}>€</Text>
        <TouchableOpacity 
            onPress={handleSave}
            style={[styles.saveButton,isButtonDisabled && styles.disabledButton]}
            disabled={isButtonDisabled} 
        >
            <Text style={styles.saveButtonText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChargeFixeItem