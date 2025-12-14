import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import { useComptes } from '../../hooks/useComptes';
import { useAuth } from '../../hooks/useAuth';
import { IChargeVariable } from '@/types';
import dayjs from 'dayjs';
import { styles } from '../../styles/screens/ChargesVariablesScreen.style';
import { useHouseholdUsers } from '../../hooks/useHouseholdUsers';
import ChargeVariableItem from './ChargeVariableItem/ChargeVariableItem';

const ChargesVariablesScreen: React.FC = () => {
    const { chargesVariables, isLoadingComptes, addChargeVariable, currentMonthData } = useComptes(); 
    const { user } = useAuth();
    const { householdUsers, getDisplayName } = useHouseholdUsers();
    
    const [description, setDescription] = useState('');
    const [montant, setMontant] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [payeurUid, setPayeurUid] = useState<string | null>(user?.id || null);
    const [beneficiairesUid, setBeneficiairesUid] = useState<string[]>([]);

    useEffect(() => {
        if (householdUsers.length > 0) {
            if (beneficiairesUid.length === 0) {
                setBeneficiairesUid(householdUsers.map(u => u.id));
            }
            if (user?.id && !payeurUid) {
                setPayeurUid(user.id);
            }
        }
    }, [householdUsers, beneficiairesUid.length, user?.id, payeurUid]);

    const handleAddDepense = useCallback(async () => {
        const montantTotal = parseFloat(montant.replace(',', '.'));

        if (!payeurUid || !currentMonthData) {
            Alert.alert("Erreur", "Le payeur ou les données mensuelles sont manquantes.");
            return;
        }

        if (beneficiairesUid.length === 0) {
            Alert.alert("Erreur de saisie", "Veuillez sélectionner au moins un bénéficiaire.");
            return;
        }

        if (!description.trim() || isNaN(montantTotal) || montantTotal <= 0) {
            Alert.alert("Erreur de saisie", "Veuillez vérifier la description et un montant valide (> 0).");
            return;
        }

        setIsSubmitting(true);

        const depenseToAdd: Omit<IChargeVariable, 'id' | 'householdId'> = {
            description: description.trim(),
            montantTotal,
            payeur: payeurUid, 
            beneficiaires: beneficiairesUid,
            date: dayjs().toISOString(),
            moisAnnee: dayjs().format('YYYY-MM'),
        };

        try {
            await addChargeVariable(depenseToAdd); 
            setDescription('');
            setMontant('');
            setPayeurUid(user?.id || null); 
            setBeneficiairesUid(householdUsers.map(u => u.id));
            setShowForm(false);
            Alert.alert("Succès", "Dépense enregistrée.");

        } catch (error) {
            console.error("Erreur Trésorerie:", error);
            Alert.alert("Erreur", "Échec de l'enregistrement de la dépense.");
        } finally {
            setIsSubmitting(false);
        }
    }, [description, montant, payeurUid, beneficiairesUid, currentMonthData, addChargeVariable, user?.id, householdUsers]);

    if (isLoadingComptes) {
        return <Text style={styles.loading}>Chargement des dépenses...</Text>;
    }

    const payeurName = getDisplayName(payeurUid ?? "");
    const benefCount = beneficiairesUid.length;
    const shareText = benefCount > 0 ? `(partagé sur ${benefCount} personne${benefCount > 1 ? 's' : ''})` : '(Aucun bénéficiaire)';

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Charges variables</Text>
            <TouchableOpacity 
                style={styles.addButton} 
                onPress={() => setShowForm(!showForm)}
                disabled={isSubmitting}
            >
                <Text style={styles.addButtonText}>{showForm ? 'Annuler l\'ajout' : '+ Ajouter une dépense'}</Text>
            </TouchableOpacity>

            {showForm && (
                <View style={styles.formContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Description (ex: Courses)"
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
                    <Text style={styles.payeurInfo}>Payé par : {payeurName} {shareText}</Text>
                    <Button 
                        title={isSubmitting ? "Enregistrement..." : "Enregistrer la dépense"} 
                        onPress={handleAddDepense}
                        disabled={isSubmitting || benefCount === 0 || !payeurUid}
                    />
                </View>
            )}

            {chargesVariables.length === 0 ? (
                <Text style={styles.loading}>Aucune dépense enregistrée pour le moment.</Text>
            ) : (
                <FlatList
                    data={chargesVariables.slice().sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <ChargeVariableItem charge={item} householdUsers={householdUsers} />}
                    style={styles.list}
                    contentContainerStyle={{ paddingBottom: 10 }}
                />
            )}
        </View>
    );
};

export default ChargesVariablesScreen;