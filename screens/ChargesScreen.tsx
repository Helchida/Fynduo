import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, Button, Alert } from 'react-native';
import { useComptes } from '../hooks/useComptes';
import { useAuth } from '../hooks/useAuth';
import { IChargeFixe } from '../types';
import { styles } from '../styles/screens/ChargesScreen.style';

interface ChargeItemProps {
  charge: IChargeFixe;
  onUpdate: (id: string, newAmount: number) => Promise<void>;
  isEditable: boolean;
}

const ChargeItem: React.FC<ChargeItemProps> = ({ charge, onUpdate, isEditable }) => {
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
        <Text style={styles.currency}>€</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          editable={isEditable && !isSaving}
          style={[styles.input, !isEditable && { backgroundColor: '#f5f5f5', color: '#999' }]}
        />
        {isEditable && (
            <Button 
                title={isSaving ? "En cours..." : "Sauvegarder"}
                onPress={handleSave} 
                disabled={isButtonDisabled} 
            />
        )}
      </View>
    </View>
  );
};


const ChargesScreen: React.FC = () => {
  const { chargesFixes, isLoadingComptes, updateChargeFixe } = useComptes();
  const { user } = useAuth(); 
  
  const userIsMorgan = user?.nom === 'Morgan';

  const handleChargeUpdate = useCallback(async (id: string, newAmount: number) => {
        try {
            await updateChargeFixe(id, newAmount);
            Alert.alert("Succès", "Montant de la charge mis à jour !");
        } catch (error) {
            Alert.alert("Erreur", "Échec de la mise à jour des charges. Vérifiez les permissions.");
            console.error("Erreur Charges:", error);
        }
    }, [updateChargeFixe]);

    if (isLoadingComptes) {
        return <Text style={styles.loading}>Chargement des charges...</Text>;
    }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Charges Fixes Mensuelles</Text>
      {!userIsMorgan && (
        <Text style={styles.warning}>Seul Morgan est autorisé à modifier ces montants.</Text>
      )}

      <FlatList
        data={chargesFixes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChargeItem 
            charge={item} 
            onUpdate={handleChargeUpdate} 
            isEditable={userIsMorgan} 
          />
        )}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default ChargesScreen;