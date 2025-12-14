import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Modal, FlatList } from 'react-native';
import { IChargeFixe, IUser } from '../../../types';
import { styles } from './ChargeFixeItem.style';
import { ChargeFixeItemProps } from './ChargeFixeItem.type';

const ChargeFixeItem: React.FC<ChargeFixeItemProps> = ({ charge, onUpdate, onDelete, householdUsers, onUpdatePayeur }) => {
  const [amount, setAmount] = useState(charge.montantMensuel.toString());
  const [isSaving, setIsSaving] = useState(false);
  const [isPayeurModalVisible, setIsPayeurModalVisible] = useState(false);

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

  const handleDeleteCharge = useCallback((chargeFixe: IChargeFixe) => {
          const confirmDelete = () => Alert.alert(
              "Confirmer la suppression",
              `Voulez-vous vraiment supprimer la charge "${chargeFixe.nom}" ?`,
              [
                  { text: "Annuler", style: "cancel" },
                  { 
                      text: "Supprimer", 
                      style: "destructive", 
                      onPress: async () => {
                          try {
                            await onDelete(chargeFixe.id); 
                  
                            Alert.alert("Succès", `Charge "${chargeFixe.nom}" supprimée.`);
                          } catch (error) {
                              Alert.alert("Erreur", "Échec de la suppression de la charge.");
                          }
                      }
                  },
              ]
          );
          
          confirmDelete();
      }, [onDelete]);

      const getPayeurDisplayName = useCallback((payeurNameOrUid: string) => {
        const userFound = householdUsers.find(u => u.id === payeurNameOrUid);
        return userFound?.displayName ?? payeurNameOrUid;
      }, [householdUsers]);

      const selectPayeur = useCallback(async (newPayeur: IUser) => {
        if (newPayeur.id !== charge.payeur) {
          setIsSaving(true);
          try {
            await onUpdatePayeur(charge.id, newPayeur.id, newPayeur.displayName); 
          } catch (error) {
            Alert.alert("Erreur", "Échec de la mise à jour du payeur.");
          } finally {
            setIsSaving(false);
            setIsPayeurModalVisible(false);
          }
        } else {
            setIsPayeurModalVisible(false);
        }
      }, [charge.payeur, charge.id, onUpdatePayeur]);

  const isButtonDisabled = parseFloat(amount) === charge.montantMensuel || isSaving;

  return (
    <View style={styles.chargeItem}>
      <View style={styles.inputRow}>
      <Text style={styles.chargeName}>{charge.nom}</Text>
      <TouchableOpacity 
                  style={styles.deleteButton} 
                  onPress={() => handleDeleteCharge(charge)}
              >
        <Text style={styles.deleteButtonText}>X</Text>
      </TouchableOpacity>
      </View>
      <TouchableOpacity 
          style={styles.payeurContainer}
          onPress={() => setIsPayeurModalVisible(true)}
          disabled={isSaving}
        >
          <Text style={styles.payeurLabel}>Payé par: </Text>
          <Text style={styles.payeurName}>{getPayeurDisplayName(charge.payeur)}</Text>
      </TouchableOpacity>
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

      <Modal
        visible={isPayeurModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPayeurModalVisible(false)}
      >
          <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                  <Text style={styles.modalHeader}>Sélectionner le nouveau payeur</Text>
                  <FlatList
                      data={householdUsers}
                      keyExtractor={item => item.id}
                      renderItem={({ item }) => (
                          <TouchableOpacity
                              style={[
                                  styles.modalItem,
                                  item.id === charge.payeur && styles.modalItemSelected
                              ]}
                              onPress={() => selectPayeur(item)}
                          >
                              <Text style={styles.modalItemText}>{item.displayName}</Text>
                          </TouchableOpacity>
                      )}
                      ItemSeparatorComponent={() => <View style={styles.separator} />}
                  />
                  <TouchableOpacity 
                      style={styles.modalCloseButton} 
                      onPress={() => setIsPayeurModalVisible(false)}
                  >
                      <Text style={styles.modalCloseButtonText}>Fermer</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>
    </View>
  );
};

export default ChargeFixeItem