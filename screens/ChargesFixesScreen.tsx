import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity, TextInput, Button } from 'react-native';
import { useComptes } from '../hooks/useComptes';
import { useAuth } from '../hooks/useAuth';
import { styles } from '../styles/screens/ChargesFixesScreen.style';
import ChargeFixeItem from '../components/fynduo/ChargeFixeItem';
import { IChargeFixe } from '../types';


const ChargesFixesScreen: React.FC = () => {
  const { chargesFixes, isLoadingComptes, updateChargeFixe, deleteChargeFixe, currentMonthData, addChargeFixe } = useComptes();

  const { user } = useAuth();
  const [nom, setNom] = useState('');
  const [montant, setMontant] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChargeUpdate = useCallback(async (id: string, newAmount: number) => {
        try {
            await updateChargeFixe(id, newAmount);
        } catch (error) {
            Alert.alert("Erreur", "Échec de la mise à jour des charges. Vérifiez les permissions.");
            console.error("Erreur Charges:", error);
        }
    }, [updateChargeFixe]);

    const handleAddDepense = useCallback(async () => {
            if (!currentMonthData) return;
            const montantMensuel = parseFloat(montant);
    
            if (!user || !user.nom) return; 
    
            if (!nom.trim() || isNaN(montantMensuel) || montantMensuel <= 0) {
                Alert.alert("Erreur de saisie", "Veuillez vérifier la description et un montant valide (> 0).");
                return;
            }
    
            setIsSubmitting(true);
    
            const chargeFixeToAdd: Omit<IChargeFixe, 'id'> = {
                nom: nom.trim(),
                montantMensuel,
                payeur: user.nom,
                moisAnnee: currentMonthData.moisAnnee,
            };
    
            try {
                await addChargeFixe(chargeFixeToAdd); 
                setNom('');
                setMontant('');
                setShowForm(false);
                Alert.alert("Succès", "Charge fixe enregistrée.");
    
            } catch (error) {
                console.error("Erreur charge fixe:", error);
                Alert.alert("Erreur", "Échec de l'enregistrement de la charge fixe.");
            } finally {
                setIsSubmitting(false);
            }
        }, [nom, montant, user, addChargeFixe]);

    if (isLoadingComptes) {
        return <Text style={styles.loading}>Chargement des charges...</Text>;
    }


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Charges fixes</Text>
      <TouchableOpacity 
                      style={styles.addButton} 
                      onPress={() => setShowForm(!showForm)}
                      disabled={isSubmitting}
                  >
                      <Text style={styles.addButtonText}>{showForm ? 'Annuler l\'ajout' : '+ Ajouter une charge fixe'}</Text>
                  </TouchableOpacity>
      {showForm && (
          <View style={styles.formContainer}>
              <TextInput
                  style={styles.input}
                  placeholder="Description (ex: Facture Internet)"
                  value={nom}
                  onChangeText={setNom}
                  editable={!isSubmitting}
              />
              <TextInput
                  style={styles.input}
                  placeholder="Montant mensuel (ex: 80.50)"
                  value={montant}
                  onChangeText={setMontant}
                  keyboardType="numeric"
                  editable={!isSubmitting}
              />
              <Text style={styles.payeurInfo}>Payé par : {user?.nom}</Text>
              <Button 
                  title={isSubmitting ? "Enregistrement..." : "Enregistrer la charge fixe"} 
                  onPress={handleAddDepense}
                  disabled={isSubmitting}
              />
          </View>
      )}
      <FlatList
        data={chargesFixes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChargeFixeItem 
            charge={item} 
            onUpdate={handleChargeUpdate} 
            onDelete={deleteChargeFixe}
          />
        )}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default ChargesFixesScreen;