import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, Alert, TouchableOpacity, Modal } from 'react-native';
import { useComptes } from '../hooks/useComptes';
import { useAuth } from '../hooks/useAuth';
import { IChargeVariable } from '../types';
import dayjs from 'dayjs';
import { styles } from '../styles/screens/ChargesVariablesScreen.style';
import ChargeItem from '../components/fynduo/ChargeVariableItem';
import { useHouseholdUsers } from '../hooks/useHouseholdUsers';

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

    const [isPayeurModalVisible, setIsPayeurModalVisible] = useState(false);
    const [isBeneficiairesModalVisible, setIsBeneficiairesModalVisible] = useState(false);

    useEffect(() => {
        // Initialise les bénéficiaires à tous les utilisateurs par défaut
        if (householdUsers.length > 0 && beneficiairesUid.length === 0) {
            setBeneficiairesUid(householdUsers.map(u => u.id));
        }
    }, [householdUsers, beneficiairesUid.length]);


    // Fonction d'affichage des bénéficiaires
    const getBeneficiairesDisplayNames = useCallback((uids: string[]) => {
        if (uids.length === 0) return "Sélectionner les bénéficiaires";
        if (uids.length === householdUsers.length) return "Tout le foyer";
        
        // Nous faisons confiance à getDisplayName pour retourner soit le nom, soit l'UID
        const names = uids
            .map(uid => getDisplayName(uid)); 
            
        const displayNames = names.slice(0, 2);

        return displayNames.join(', ') + (names.length > 2 ? ` et ${names.length - 2} autres` : '');
    }, [householdUsers, getDisplayName]);

    const handleAddDepense = useCallback(async () => {
        const montantTotal = parseFloat(montant);

        if (!currentMonthData || !payeurUid || beneficiairesUid.length === 0) {
            Alert.alert("Erreur de saisie", "Veuillez sélectionner le payeur et au moins un bénéficiaire.");
            return;
        }

        if (!description.trim() || isNaN(montantTotal) || montantTotal <= 0) {
            Alert.alert("Erreur de saisie", "Veuillez vérifier la description et un montant valide (> 0).");
            return;
        }

        setIsSubmitting(true);

        const depenseToAdd: Omit<IChargeVariable, 'id' | 'householdId'> = {
            description: description.trim(),
            montantTotal: parseFloat(montantTotal.toFixed(2)),
            
            payeur: payeurUid,
            beneficiaires: beneficiairesUid,
            
            date: dayjs().toISOString(),
            moisAnnee: currentMonthData.moisAnnee,
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

    const selectPayeur = (uid: string) => {
        setPayeurUid(uid);
        setIsPayeurModalVisible(false);
    };

    const toggleBeneficiaire = (uid: string) => {
        setBeneficiairesUid(prev => 
            prev.includes(uid) 
                ? prev.filter(id => id !== uid) // Retirer
                : [...prev, uid] // Ajouter
        );
    };

    if (isLoadingComptes) {
        return <Text style={styles.loading}>Chargement des dépenses...</Text>;
    }

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

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Payé par</Text>
                        <TouchableOpacity
                            style={[styles.input, styles.dropdownInput]}
                            onPress={() => setIsPayeurModalVisible(true)}
                            disabled={isSubmitting}
                        >
                            <Text style={!payeurUid ? styles.placeholderText : styles.inputText}>
                                {getDisplayName(payeurUid ?? "")}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Pour qui (Bénéficiaires)</Text>
                        <TouchableOpacity
                            style={[styles.input, styles.dropdownInput]}
                            onPress={() => setIsBeneficiairesModalVisible(true)}
                            disabled={isSubmitting}
                        >
                            <Text style={beneficiairesUid.length === 0 ? styles.placeholderText : styles.inputText}>
                                {getBeneficiairesDisplayNames(beneficiairesUid)}
                            </Text>
                        </TouchableOpacity>
                        <Text style={styles.payeurInfo}>La dépense sera divisée entre ces bénéficiaires.</Text>
                    </View>
                    <Button 
                        title={isSubmitting ? "Enregistrement..." : "Enregistrer la dépense"} 
                        onPress={handleAddDepense}
                        disabled={isSubmitting}
                    />
                </View>
            )}

            {chargesVariables.length === 0 ? (
                <Text style={styles.loading}>Aucune dépense enregistrée pour le moment.</Text>
            ) : (
                <FlatList
                    data={chargesVariables.slice().sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <ChargeItem charge={item} householdUsers={householdUsers} />} 
                    style={styles.list}
                    contentContainerStyle={{ paddingBottom: 10 }}
                />
            )}

            <Modal
                visible={isPayeurModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsPayeurModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>Sélectionner le payeur</Text>
                        <FlatList
                            data={householdUsers}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.modalItem,
                                        item.id === payeurUid && styles.modalItemSelected
                                    ]}
                                    onPress={() => selectPayeur(item.id)}
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

            {/* MODAL SÉLECTION BÉNÉFICIAIRES */}
            <Modal
                visible={isBeneficiairesModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsBeneficiairesModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>Sélectionner les bénéficiaires</Text>
                        <FlatList
                            data={householdUsers}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => {
                                const isSelected = beneficiairesUid.includes(item.id);
                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.modalItem,
                                            isSelected && styles.modalItemSelected
                                        ]}
                                        onPress={() => toggleBeneficiaire(item.id)}
                                    >
                                        <Text style={styles.modalItemText}>
                                            {item.displayName} 
                                            {isSelected ? ' (Sélectionné)' : ''}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            }}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                        />
                        <TouchableOpacity 
                            style={styles.modalCloseButton} 
                            onPress={() => setIsBeneficiairesModalVisible(false)}
                        >
                            <Text style={styles.modalCloseButtonText}>Fermer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ChargesVariablesScreen;