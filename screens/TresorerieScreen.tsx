import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import { useComptes } from '../hooks/useComptes';
import { useAuth } from '../hooks/useAuth';
import { IChargeVariable } from '../types';
import dayjs from 'dayjs';
import { styles } from '../styles/screens/TresorerieScreen.style';

interface DepenseItemProps {
    depense: IChargeVariable;
}

const DepenseItem: React.FC<DepenseItemProps> = React.memo(({ depense }) => (
    <View style={styles.depenseItem}>
        <View style={styles.depenseInfo}>
            <Text style={styles.depenseDesc}>{depense.description}</Text>
            <Text style={styles.depenseDate}>{dayjs(depense.date).format('DD MMM à HH:mm')}</Text>
        </View>
        <View style={styles.depenseDetails}>
            <Text style={styles.depenseAmount}>
                {depense.montantTotal.toFixed(2)} €
            </Text>
            <Text style={styles.depensePayer}>Payé par {depense.payeur}</Text>
        </View>
    </View>
));


const TresorerieScreen: React.FC = () => {
    const { chargesVariables, isLoadingComptes, addChargeVariable } = useComptes(); 
    const { user } = useAuth();
    
    const [description, setDescription] = useState('');
    const [montant, setMontant] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddDepense = useCallback(async () => {
        const montantTotal = parseFloat(montant);

        if (!user || !user.nom) return; 

        if (!description.trim() || isNaN(montantTotal) || montantTotal <= 0) {
            Alert.alert("Erreur de saisie", "Veuillez vérifier la description et un montant valide (> 0).");
            return;
        }

        setIsSubmitting(true);

        const depenseToAdd: Omit<IChargeVariable, 'id'> = {
            description: description.trim(),
            montantTotal,
            payeur: user.nom, 
            beneficiaires: ['Morgan', 'Juliette'],
            date: dayjs().toISOString(),
            moisAnnee: dayjs().format('YYYY-MM'),
        };

        try {
            await addChargeVariable(depenseToAdd); 
            setDescription('');
            setMontant('');
            setShowForm(false);
            Alert.alert("Succès", "Dépense enregistrée.");

        } catch (error) {
            console.error("Erreur Trésorerie:", error);
            Alert.alert("Erreur", "Échec de l'enregistrement de la dépense.");
        } finally {
            setIsSubmitting(false);
        }
    }, [description, montant, user, addChargeVariable]);

    if (isLoadingComptes) {
        return <Text style={styles.loading}>Chargement des dépenses...</Text>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Trésorerie / Dépenses Variables</Text>
            <TouchableOpacity 
                style={styles.addButton} 
                onPress={() => setShowForm(!showForm)}
                disabled={isSubmitting}
            >
                <Text style={styles.addButtonText}>{showForm ? 'Annuler l\'ajout' : '+ Ajouter une Dépense'}</Text>
            </TouchableOpacity>

            {showForm && (
                <View style={styles.formContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Description (ex: Courses Leclerc)"
                        value={description}
                        onChangeText={setDescription}
                        editable={!isSubmitting}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Montant total (ex: 80.50)"
                        value={montant}
                        onChangeText={setMontant}
                        keyboardType="numeric"
                        editable={!isSubmitting}
                    />
                    <Text style={styles.payeurInfo}>Payé par : **{user?.nom}** (partagé 50/50 par défaut)</Text>
                    <Button 
                        title={isSubmitting ? "Enregistrement..." : "Enregistrer la Dépense"} 
                        onPress={handleAddDepense}
                        disabled={isSubmitting}
                    />
                </View>
            )}

            {chargesVariables.length === 0 ? (
                <Text style={styles.loading}>Aucune dépense variable enregistrée pour le moment.</Text>
            ) : (
                <FlatList
                    data={chargesVariables.slice().sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <DepenseItem depense={item} />}
                    style={styles.list}
                    contentContainerStyle={{ paddingBottom: 10 }}
                />
            )}
        </View>
    );
};

export default TresorerieScreen;