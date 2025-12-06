import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useComptes } from '../hooks/useComptes';
import { useAuth } from '../hooks/useAuth'; 
import { styles } from '../styles/screens/LoyerScreen.style';

const LoyerScreen: React.FC = () => {
  const { currentMonthData, updateLoyer, isLoadingComptes } = useComptes();
  const { user } = useAuth();
  
  const [loyerTotal, setLoyerTotal] = useState('');
  const [aplMorgan, setAplMorgan] = useState('');    
  const [aplJuliette, setAplJuliette] = useState('');
  
  useEffect(() => {
    if (currentMonthData) {
      setLoyerTotal(currentMonthData.loyerTotal.toString());
      setAplMorgan(currentMonthData.aplMorgan.toString());        
      setAplJuliette(currentMonthData.aplJuliette.toString());    
    }
  }, [currentMonthData]);

  const handleSave = async () => {
    const total = parseFloat(loyerTotal);
    const aplM = parseFloat(aplMorgan);
    const aplJ = parseFloat(aplJuliette);

    if (isNaN(total) || isNaN(aplM) || isNaN(aplJ) || total < 0 || aplM < 0 || aplJ < 0) {
      Alert.alert("Erreur", "Veuillez entrer des montants valides.");
      return;
    }
    
    if (!currentMonthData) {
        Alert.alert("Erreur", "Données du mois non chargées. Impossible d'enregistrer.");
        return;
    }

    try {
        await updateLoyer(total, aplM, aplJ); 
        Alert.alert("Succès", "Le loyer et les APL individuels ont été mis à jour.");
    } catch (error) {
        console.error("Erreur Loyer:", error);
        Alert.alert("Erreur", "Échec de l'enregistrement dans la base de données. Consultez la console.");
    }
  };

  if (isLoadingComptes) {
    return <Text style={styles.loading}>Chargement des données loyer...</Text>;
  }
  
  const totalApl = (parseFloat(aplMorgan) || 0) + (parseFloat(aplJuliette) || 0);
  const loyerNet = (parseFloat(loyerTotal) || 0) - totalApl;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Gestion du loyer</Text>

      <Text style={styles.label}>Loyer total à payer</Text>
      <TextInput
        style={styles.input}
        value={loyerTotal}
        onChangeText={setLoyerTotal}
        keyboardType="numeric"
        placeholder="e.g., 1200.00"
      />

      <Text style={styles.label}>APL reçus (Morgan)</Text>
      <TextInput
        style={styles.input}
        value={aplMorgan}
        onChangeText={setAplMorgan}
        keyboardType="numeric"
        placeholder="e.g., 120.00"
      />

      <Text style={styles.label}>APL reçus (Juliette)</Text>
      <TextInput
        style={styles.input}
        value={aplJuliette}
        onChangeText={setAplJuliette}
        keyboardType="numeric"
        placeholder="e.g., 80.00"
      />
      
      <Text style={styles.result}>
        Loyer Net (Total - APL) : {loyerNet.toFixed(2)} €
      </Text>

      <View style={styles.validationContainer}>
          <TouchableOpacity style={styles.validationButton} onPress={handleSave} disabled={isLoadingComptes}>
              <Text style={styles.validationButtonText}>{"Enregistrer"}</Text>
          </TouchableOpacity>
          {isLoadingComptes && <ActivityIndicator size="small" color="#2ecc71" style={{ marginTop: 10 }} />}
      </View>
      
    </ScrollView>
  );
};

export default LoyerScreen;