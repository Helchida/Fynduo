import React, { useCallback } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import { useComptes } from '../hooks/useComptes';
import { styles } from '../styles/screens/ChargesFixesScreen.style';
import ChargeFixeItem from '../components/fynduo/ChargeFixeItem';


const ChargesFixesScreen: React.FC = () => {
  const { chargesFixes, isLoadingComptes, updateChargeFixe, deleteChargeFixe } = useComptes();

  const handleChargeUpdate = useCallback(async (id: string, newAmount: number) => {
        try {
            await updateChargeFixe(id, newAmount);
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
      <Text style={styles.header}>Charges fixes</Text>
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