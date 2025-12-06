import React, { useState, useEffect, useCallback } from 'react';
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
import { RootStackNavigationProp, Colocataire, IChargeFixe } from '../types';
import { IReglementData } from '../context/ComptesContext';
import { useComptes } from '../hooks/useComptes';
import { nanoid } from 'nanoid/non-secure';
import { styles } from '../styles/screens/RegulationScreen.style';


interface ChargeFixeForm extends IChargeFixe {
    montantForm: string;
    isNew?: boolean; 
}

interface ChargeFixeRowProps {
    charge: ChargeFixeForm;
    onUpdate: (id: string, field: 'nom' | 'montantForm', value: string) => void;
    onDelete: (id: string) => void;
    coloc: Colocataire;
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
    
    const { 
        currentMonthData, 
        chargesFixes, 
        cloturerMois, 
        updateChargeFixe, 
        addChargeFixe, 
        deleteChargeFixe, 
        isLoadingComptes,
        soldeFinal 
    } = useComptes();

    const [loyerTotal, setLoyerTotal] = useState(''); 
    const [aplMorgan, setAplMorgan] = useState('');
    const [aplJuliette, setAplJuliette] = useState('');
    const [chargesMorganForm, setChargesMorganForm] = useState<ChargeFixeForm[]>([]);
    const [chargesJulietteForm, setChargesJulietteForm] = useState<ChargeFixeForm[]>([]);
    const [detteMorganToJuliette, setDetteMorganToJuliette] = useState('0');
    const [detteJulietteToMorgan, setDetteJulietteToMorgan] = useState('0');

    useEffect(() => {
        if (currentMonthData && currentMonthData.statut === 'finalisé') {
            navigation.replace('SummaryRegulation');
        }
    }, [currentMonthData, navigation]);

    useEffect(() => {
    if (!currentMonthData || chargesFixes.length === 0) return;

    if (chargesMorganForm.length === 0 && chargesJulietteForm.length === 0) {
        const mapChargesToForm = (charges: IChargeFixe[], coloc: Colocataire): ChargeFixeForm[] => {
            return charges
                .filter(c => c.payeur === coloc)
                .map(c => ({
                    ...c,
                    montantForm: c.montantMensuel.toString(),
                    isNew: false,
                }));
        };

        setChargesMorganForm(mapChargesToForm(chargesFixes, 'Morgan'));
        setChargesJulietteForm(mapChargesToForm(chargesFixes, 'Juliette'));

        setLoyerTotal(currentMonthData.loyerTotal.toString());
        setAplMorgan(currentMonthData.aplMorgan.toString());
        setAplJuliette(currentMonthData.aplJuliette.toString());
    }
}, [currentMonthData, chargesFixes]);
    
    const handleAddCharge = useCallback((coloc: Colocataire) => {
        if (!currentMonthData) return;
        
        const newCharge: ChargeFixeForm = {
            id: nanoid(), 
            moisAnnee: currentMonthData.moisAnnee,
            nom: `Nouvelle Charge ${coloc}`,
            montantMensuel: 0,
            montantForm: '0',
            payeur: coloc,
            isNew: true, 
        };

        if (coloc === 'Morgan') {
            setChargesMorganForm(prev => [...prev, newCharge]);
        } else {
            setChargesJulietteForm(prev => [...prev, newCharge]);
        }
    }, [currentMonthData]);

    const handleDeleteCharge = useCallback((id: string, coloc: Colocataire) => {
        const chargesList = coloc === 'Morgan' ? chargesMorganForm : chargesJulietteForm;
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

                            const updater = (prevCharges: ChargeFixeForm[]) => 
                                prevCharges.filter(charge => charge.id !== id);

                            if (coloc === 'Morgan') {
                                setChargesMorganForm(updater);
                            } else {
                                setChargesJulietteForm(updater);
                            }
                            
                            Alert.alert("Succès", `Charge "${chargeToDelete.nom}" supprimée.`);
                        } catch (error) {
                            Alert.alert("Erreur", "Échec de la suppression de la charge.");
                        }
                    }
                },
            ]
        );
        
        confirmDelete();
    }, [chargesMorganForm, chargesJulietteForm, deleteChargeFixe]); 

    
    if (isLoadingComptes || !currentMonthData) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#3498db" /></View>;
    }

    if (currentMonthData.statut === 'finalisé') {
        return <View style={styles.loadingContainer}><Text>Redirection vers le récapitulatif...</Text></View>;
    }
    
    
    const updateChargeForm = (coloc: Colocataire) => (id: string, field: 'nom' | 'montantForm', value: string) => {
        const updater = (prevCharges: ChargeFixeForm[]) => 
            prevCharges.map(charge => 
                charge.id === id ? { ...charge, [field]: value } : charge
            );

        if (coloc === 'Morgan') {
            setChargesMorganForm(updater);
        } else {
            setChargesJulietteForm(updater);
        }
    };
    
    const handleValidation = async () => {
        if (!currentMonthData || currentMonthData.statut === 'finalisé') {
            Alert.alert("Attention", "Ce mois est déjà clôturé ou les données sont manquantes.");
            return;
        }

        try {
            const allCharges = [...chargesMorganForm, ...chargesJulietteForm];
            const newCharges = allCharges.filter(c => c.isNew);
            const existingCharges = allCharges.filter(c => !c.isNew);
            
            await Promise.all(
                newCharges.map(charge => {
                    const newChargeData: Omit<IChargeFixe, 'id'> = {
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

            const dataToSubmit: IReglementData = {
                loyerTotal: parseFloat(loyerTotal) || 0,
                aplMorgan: parseFloat(aplMorgan) || 0,
                aplJuliette: parseFloat(aplJuliette) || 0,
                detteMorganToJuliette: parseFloat(detteMorganToJuliette) || 0, 
                detteJulietteToMorgan: parseFloat(detteJulietteToMorgan) || 0,
            };

            await cloturerMois(dataToSubmit);

            Alert.alert(
                "Clôture réussie", 
                `Le règlement est finalisé. Solde Final: ${soldeFinal.toFixed(2)}€`, 
                [{ text: "OK", onPress: () => navigation.navigate('SummaryRegulation') }] 
            ); 

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
                <Text style={styles.sectionTitle}>💰 Loyer (Mois: {currentMonthData.moisAnnee})</Text>
                
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Loyer total (€)</Text>
                    <TextInput
                        style={styles.mainInput}
                        keyboardType="numeric"
                        value={loyerTotal}
                        onChangeText={(text) => setLoyerTotal(text.replace(',', '.'))}
                    />
                </View>
                
                <View style={styles.inputRow}>
                    <View style={styles.inputGroupHalf}>
                        <Text style={styles.inputLabel}>APL Morgan (€)</Text>
                        <TextInput
                            style={styles.mainInput}
                            keyboardType="numeric"
                            value={aplMorgan}
                            onChangeText={(text) => setAplMorgan(text.replace(',', '.'))}
                        />
                    </View>
                    <View style={styles.inputGroupHalf}>
                        <Text style={styles.inputLabel}>APL Juliette (€)</Text>
                        <TextInput
                            style={styles.mainInput}
                            keyboardType="numeric"
                            value={aplJuliette}
                            onChangeText={(text) => setAplJuliette(text.replace(',', '.'))}
                        />
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚙️ Charges Fixes</Text>
                
                <View style={styles.subSection}>
                    <View style={styles.subSectionHeader}>
                        <Text style={styles.subSectionTitle}>Charges Morgan</Text>
                        <TouchableOpacity 
                            onPress={() => handleAddCharge('Morgan')}
                            style={styles.addButton}
                        >
                            <Text style={styles.addButtonText}>+ Ajouter</Text>
                        </TouchableOpacity>
                    </View>
                    {chargesMorganForm.map(charge => (
                        <ChargeFixeRow 
                            key={charge.id} 
                            charge={charge} 
                            coloc={'Morgan'}
                            onUpdate={updateChargeForm('Morgan')}
                            onDelete={(id) => handleDeleteCharge(id, 'Morgan')}
                        />
                    ))}
                </View>

                <View style={styles.subSection}>
                    <View style={styles.subSectionHeader}>
                        <Text style={styles.subSectionTitle}>Charges Juliette</Text>
                        <TouchableOpacity 
                            onPress={() => handleAddCharge('Juliette')}
                            style={styles.addButton}
                        >
                            <Text style={styles.addButtonText}>+ Ajouter</Text>
                        </TouchableOpacity>
                    </View>
                    {chargesJulietteForm.map(charge => (
                        <ChargeFixeRow 
                            key={charge.id} 
                            charge={charge} 
                            coloc={'Juliette'}
                            onUpdate={updateChargeForm('Juliette')}
                            onDelete={(id) => handleDeleteCharge(id, 'Juliette')}
                        />
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>💸 Ajustement charges variables</Text>
                <Text style={styles.inputLabel}>Saisissez les ajustements des charges variables ce mois-ci.</Text>
                
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Morgan doit à Juliette (€)</Text>
                    <TextInput
                        style={styles.mainInput}
                        keyboardType="numeric"
                        placeholder="0.00"
                        value={detteMorganToJuliette}
                        onChangeText={(text) => setDetteMorganToJuliette(text.replace(',', '.'))}
                    />
                </View>
                
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Juliette doit à Morgan (€)</Text>
                    <TextInput
                        style={styles.mainInput}
                        keyboardType="numeric"
                        placeholder="0.00"
                        value={detteJulietteToMorgan}
                        onChangeText={(text) => setDetteJulietteToMorgan(text.replace(',', '.'))}
                    />
                </View>
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