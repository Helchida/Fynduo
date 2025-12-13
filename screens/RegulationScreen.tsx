import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TextInput, 
    TouchableOpacity,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp, IChargeFixe, IDette } from '../types';
import { IReglementData } from '../context/ComptesContext';
import { useComptes } from '../hooks/useComptes';
import { useAuth } from '../hooks/useAuth';
import { useHouseholdUsers } from '../hooks/useHouseholdUsers';
import { nanoid } from 'nanoid/non-secure';
import { styles } from '../styles/screens/RegulationScreen.style';
import dayjs from 'dayjs';

interface ChargeFixeForm extends IChargeFixe {
    montantForm: string;
    isNew?: boolean; 
}

interface ChargeFixeRowProps {
    charge: ChargeFixeForm;
    onUpdate: (id: string, field: 'nom' | 'montantForm', value: string) => void;
    onDelete: (id: string) => void;
    coloc: string;
}

const ChargeFixeRow: React.FC<ChargeFixeRowProps> = ({ charge, onUpdate, onDelete, coloc }) => (
    <View style={styles.chargeRow}>
        <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Description (ex: Gaz)"
            value={charge.nom}
            editable={charge.isNew} 
            onChangeText={(text) => onUpdate(charge.id, 'nom', text)}
        />
        <TextInput
            style={[styles.input, styles.montantInput]}
            placeholder="Montant (€)"
            keyboardType="numeric"
            value={charge.montantForm}
            onChangeText={(text) => onUpdate(charge.id, 'montantForm', text.replace(',', '.'))}
        />
        <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={() => onDelete(charge.id)}
        >
            <Text style={styles.deleteButtonText}>X</Text>
        </TouchableOpacity>
    </View>
);


const RegulationScreen: React.FC = () => {

    const navigation = useNavigation<RootStackNavigationProp>();
    
    const { user } = useAuth();
    const householdId = user?.householdId;
    const { householdUsers, getDisplayName } = useHouseholdUsers();
    
    const { 
        currentMonthData, 
        chargesFixes, 
        cloturerMois, 
        updateChargeFixe, 
        addChargeFixe, 
        deleteChargeFixe, 
        isLoadingComptes, 
    } = useComptes();

    const [loyerTotal, setLoyerTotal] = useState(''); 
    const [apportsAPLForm, setApportsAPLForm] = useState<Record<string, string>>({}); 
    const [chargesFormMap, setChargesFormMap] = useState<Record<string, ChargeFixeForm[]>>({}); 
    const [dettesAjustements, setDettesAjustements] = useState<Record<string, string>>({}); 

    const moisDeLoyerAffiche = currentMonthData?.moisAnnee
        ? dayjs(currentMonthData.moisAnnee).add(1, 'month').format('YYYY-MM')
        : dayjs().add(1, 'month').format('YYYY-MM');
    
    

    const user1 = householdUsers[0]; 
    const user2 = householdUsers[1];
    
    const uid1 = user1?.id || 'UID1_INCONNU'; 
    const uid2 = user2?.id || 'UID2_INCONNU'; 

    useEffect(() => {
        if (currentMonthData && currentMonthData.statut === 'finalisé') {
            navigation.replace('SummaryRegulation');
        }
    }, [currentMonthData, navigation]);

    useEffect(() => {
        if (!currentMonthData || chargesFixes.length === 0 || householdUsers.length === 0) return;

        const isInitialized = Object.keys(chargesFormMap).length > 0;
        if (isInitialized) return;

        const initialChargesMap: Record<string, ChargeFixeForm[]> = {};
        const initialApl: Record<string, string> = {};

        householdUsers.forEach(u => {
            const userCharges = chargesFixes
                .filter(c => c.payeur === u.id)
                .map(c => ({
                    ...c,
                    montantForm: c.montantMensuel.toString(),
                    isNew: false,
                }));
            
            initialChargesMap[u.id] = userCharges;
            
            const aplAmount = currentMonthData.apportsAPL[u.id] || 0;
            initialApl[u.id] = aplAmount.toString();
        });

        setChargesFormMap(initialChargesMap);
        setApportsAPLForm(initialApl);

        setLoyerTotal(currentMonthData.loyerTotal.toString());
        
    }, [currentMonthData, chargesFixes, householdUsers]);


    const handleAddCharge = useCallback((targetUid: string) => {
        if (!currentMonthData || !householdId) return;
        
        const newCharge: ChargeFixeForm = {
            id: nanoid(), 
            householdId: householdId,
            moisAnnee: currentMonthData.moisAnnee,
            nom: `Nouvelle Charge (${getDisplayName(targetUid)})`,
            montantMensuel: 0,
            montantForm: '0',
            payeur: targetUid, 
            isNew: true, 
        };

        setChargesFormMap(prev => ({
            ...prev,
            [targetUid]: [...(prev[targetUid] || []), newCharge]
        }));
    }, [currentMonthData, getDisplayName]);

    
    const updateChargeForm = useCallback((targetUid: string) => (id: string, field: 'nom' | 'montantForm', value: string) => {
        
        const updater = (prevCharges: ChargeFixeForm[]) => 
            prevCharges.map(charge => 
                charge.id === id ? { ...charge, [field]: value } : charge
            );

        setChargesFormMap(prev => ({
            ...prev,
            [targetUid]: updater(prev[targetUid] || [])
        }));
    }, []);

    const handleDeleteCharge = useCallback((id: string, targetUid: string) => {
        const chargesList = chargesFormMap[targetUid] || [];
        const chargeToDelete = chargesList.find(c => c.id === id);

        if (!chargeToDelete) return;

        const confirmDelete = () => Alert.alert(
            "Confirmer la suppression",
            `Voulez-vous vraiment supprimer la charge "${chargeToDelete.nom}" ?`,
            [
                { text: "Annuler", style: "cancel" },
                { 
                    text: "Supprimer", 
                    style: "destructive", 
                    onPress: async () => {
                        try {
                            if (!chargeToDelete.isNew) {
                                await deleteChargeFixe(id); 
                            }

                            setChargesFormMap(prev => ({
                                ...prev,
                                [targetUid]: prev[targetUid].filter(charge => charge.id !== id)
                            }));
                            
                            Alert.alert("Succès", `Charge "${chargeToDelete.nom}" supprimée.`);
                        } catch (error) {
                            Alert.alert("Erreur", "Échec de la suppression de la charge.");
                        }
                    }
                },
            ]
        );
        
        confirmDelete();
    }, [chargesFormMap, deleteChargeFixe]); 
    
    if (isLoadingComptes || !currentMonthData || householdUsers.length < 2) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#3498db" /></View>;
    }
    
    
    const handleValidation = async () => {
        if (currentMonthData.statut === 'finalisé') {
            Alert.alert("Attention", "Ce mois est déjà clôturé.");
            return;
        }

        try {
            const allCharges = Object.values(chargesFormMap).flat(); 
            const newCharges = allCharges.filter(c => c.isNew);
            const existingCharges = allCharges.filter(c => !c.isNew);
            
            await Promise.all(
                newCharges.map(charge => {
                    const newChargeData: Omit<IChargeFixe, 'id' | 'householdId'> = {
                        moisAnnee: currentMonthData.moisAnnee,
                        nom: charge.nom || `Charge ajoutée (${charge.payeur})`,
                        montantMensuel: parseFloat(charge.montantForm) || 0,
                        payeur: charge.payeur 
                    };
                    return addChargeFixe(newChargeData); 
                })
            );
            
            await Promise.all(
                existingCharges.map(charge => 
                    updateChargeFixe(charge.id, parseFloat(charge.montantForm) || 0)
                )
            );

            const apportsAPL: Record<string, number> = {};
            Object.entries(apportsAPLForm).forEach(([uid, amountString]) => {
                apportsAPL[uid] = parseFloat(amountString) || 0;
            });
            
            const dettesToSubmit: IDette[] = [];

            const key1to2 = `${uid1}-${uid2}`;
            const d1to2 = parseFloat(dettesAjustements[key1to2] || '0') || 0;
            if (d1to2 > 0) {
                dettesToSubmit.push({ 
                    debiteurUid: uid1,
                    creancierUid: uid2,
                    montant: d1to2 
                });
            }
            
            const key2to1 = `${uid2}-${uid1}`;
            const d2to1 = parseFloat(dettesAjustements[key2to1] || '0') || 0;
            if (d2to1 > 0) {
                dettesToSubmit.push({ 
                    debiteurUid: uid2,
                    creancierUid: uid1,
                    montant: d2to1 
                });
            }

            const dataToSubmit: IReglementData = {
                loyerTotal: parseFloat(loyerTotal) || 0,
                apportsAPL: apportsAPL, 
                dettes: dettesToSubmit,
                loyerPayeurUid: currentMonthData.loyerPayeurUid || user?.id || uid1, 
            };

            await cloturerMois(dataToSubmit);
            navigation.navigate('SummaryRegulation');


        } catch (error) {
            Alert.alert("Erreur de Clôture", "La clôture a échoué. " + (error as Error).message);
        }
    };


    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            
            <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                    Statut du mois ({currentMonthData.moisAnnee}) : {currentMonthData.statut.toUpperCase()}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>💰 Loyer (Mois: {moisDeLoyerAffiche})</Text> 
                
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Loyer total pour le mois {moisDeLoyerAffiche} (€)</Text> 
                    <TextInput
                        style={styles.mainInput}
                        keyboardType="numeric"
                        value={loyerTotal}
                        onChangeText={(text) => setLoyerTotal(text.replace(',', '.'))}
                    />
                </View>
                
                <View style={styles.inputRow}>
                    {householdUsers.map(u => {
                        const aplAmount = apportsAPLForm[u.id];
                        
                        const handleChangeApl = (text: string) => {
                            setApportsAPLForm(prev => ({
                                ...prev,
                                [u.id]: text.replace(',', '.')
                            }));
                        };

                        return (
                            <View key={u.id} style={styles.inputGroupHalf}>
                                <Text style={styles.inputLabel}>APL {getDisplayName(u.id)} (€)</Text>
                                <TextInput
                                    style={styles.mainInput}
                                    keyboardType="numeric"
                                    value={aplAmount}
                                    onChangeText={handleChangeApl}
                                />
                            </View>
                        );
                    })}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚙️ Charges Fixes</Text>
                
                {householdUsers.map(u => (
                    <View key={u.id} style={styles.subSection}>
                        <View style={styles.subSectionHeader}>
                            <Text style={styles.subSectionTitle}>Charges {getDisplayName(u.id)}</Text>
                            <TouchableOpacity 
                                onPress={() => handleAddCharge(u.id)}
                                style={styles.addButton}
                            >
                                <Text style={styles.addButtonText}>+ Ajouter</Text>
                            </TouchableOpacity>
                        </View>
                        {chargesFormMap[u.id] && chargesFormMap[u.id].map(charge => (
                            <ChargeFixeRow 
                                key={charge.id} 
                                charge={charge} 
                                coloc={u.id} 
                                onUpdate={updateChargeForm(u.id)}
                                onDelete={(id) => handleDeleteCharge(id, u.id)}
                            />
                        ))}
                    </View>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>💸 Ajustement charges variables</Text>
                <Text style={styles.inputLabel}>Saisissez les ajustements des charges variables ce mois-ci.</Text>
                
                {householdUsers.length >= 2 && user1 && user2 && (
                    <>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{getDisplayName(uid1)} doit à {getDisplayName(uid2)} (€)</Text>
                            <TextInput
                                style={styles.mainInput}
                                keyboardType="numeric"
                                placeholder="0.00"
                                value={dettesAjustements[`${uid1}-${uid2}`]}
                                onChangeText={(text) => setDettesAjustements(prev => ({ 
                                    ...prev, 
                                    [`${uid1}-${uid2}`]: text.replace(',', '.') 
                                }))}
                            />
                        </View>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{getDisplayName(uid2)} doit à {getDisplayName(uid1)} (€)</Text>
                            <TextInput
                                style={styles.mainInput}
                                keyboardType="numeric"
                                placeholder="0.00"
                                value={dettesAjustements[`${uid2}-${uid1}`]}
                                onChangeText={(text) => setDettesAjustements(prev => ({ 
                                    ...prev, 
                                    [`${uid2}-${uid1}`]: text.replace(',', '.') 
                                }))}
                            />
                        </View>
                    </>
                )}
            </View>

            <View style={styles.validationContainer}>
                <TouchableOpacity style={styles.validationButton} onPress={handleValidation} disabled={isLoadingComptes}>
                    <Text style={styles.validationButtonText}>{"Clôturer le mois"}</Text>
                </TouchableOpacity>
                {isLoadingComptes && <ActivityIndicator size="small" color="#2ecc71" style={{ marginTop: 10 }} />}
            </View>

        </ScrollView>
    );
};

export default RegulationScreen;