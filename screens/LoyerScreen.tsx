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
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        if (currentMonthData) {
            setLoyerTotal(currentMonthData.loyerTotal.toFixed(2));
            setAplMorgan(currentMonthData.aplMorgan.toFixed(2));         
            setAplJuliette(currentMonthData.aplJuliette.toFixed(2));     
        }
    }, [currentMonthData]);

    const handleSave = async () => {
        const total = parseFloat(loyerTotal.replace(',', '.'));
        const aplM = parseFloat(aplMorgan.replace(',', '.'));
        const aplJ = parseFloat(aplJuliette.replace(',', '.'));

        if (isNaN(total) || isNaN(aplM) || isNaN(aplJ) || total < 0 || aplM < 0 || aplJ < 0) {
            Alert.alert("Erreur", "Veuillez entrer des montants valides.");
            return;
        }
        
        if (!currentMonthData) {
            Alert.alert("Erreur", "Données du mois non chargées. Impossible d'enregistrer.");
            return;
        }

        setIsSaving(true);
        try {
            await updateLoyer(
                parseFloat(total.toFixed(2)), 
                parseFloat(aplM.toFixed(2)), 
                parseFloat(aplJ.toFixed(2))
            ); 
            Alert.alert("Succès", "Le loyer et les APL individuels ont été mis à jour.");
        } catch (error) {
            console.error("Erreur Loyer:", error);
            Alert.alert("Erreur", "Échec de l'enregistrement dans la base de données. Consultez la console.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoadingComptes) {
        return <Text style={styles.loading}>Chargement des données loyer...</Text>;
    }
    
    const totalApl = (parseFloat(aplMorgan) || 0) + (parseFloat(aplJuliette) || 0);
    const loyerNet = (parseFloat(loyerTotal) || 0) - totalApl;

    const isDisabled = isLoadingComptes || isSaving;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.header}>Gestion du loyer</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Loyer total à payer (€)</Text>
                <TextInput
                    style={styles.input}
                    value={loyerTotal}
                    onChangeText={setLoyerTotal}
                    keyboardType="numeric"
                    placeholder="e.g., 1200.00"
                    editable={!isDisabled}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>APL reçus (Morgan) (€)</Text>
                <TextInput
                    style={styles.input}
                    value={aplMorgan}
                    onChangeText={setAplMorgan}
                    keyboardType="numeric"
                    placeholder="e.g., 120.00"
                    editable={!isDisabled}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>APL reçus (Juliette) (€)</Text>
                <TextInput
                    style={styles.input}
                    value={aplJuliette}
                    onChangeText={setAplJuliette}
                    keyboardType="numeric"
                    placeholder="e.g., 80.00"
                    editable={!isDisabled}
                />
            </View>
            
            <View style={styles.resultContainer}>
                <Text style={styles.resultLabel}>Loyer Net (Total - APL)</Text>
                <Text style={styles.resultValue}>{loyerNet.toFixed(2)} €</Text>
            </View>

            <View style={styles.validationContainer}>
                <TouchableOpacity 
                    style={[
                        styles.validationButton, 
                        isDisabled && styles.disabledButton 
                    ]} 
                    onPress={handleSave} 
                    disabled={isDisabled}
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.validationButtonText}>{"Enregistrer"}</Text>
                    )}
                </TouchableOpacity>
            </View>
            
        </ScrollView>
    );
};

export default LoyerScreen;