import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { RootStackRouteProp, ICompteMensuel, IChargeVariable } from '../types';
import { useCalculs, IResultatsCalcul } from '../hooks/useCalculs';
import * as DB from '../services/firebase/db';
import dayjs from 'dayjs';
import { styles } from '../styles/screens/HistoryDetailScreen.style';
import 'dayjs/locale/fr';
import { useAuth } from '../hooks/useAuth';
dayjs.locale('fr');

type HistoryDetailRouteProp = RootStackRouteProp<'HistoryDetail'>;

interface IHistoricalData {
    compte: ICompteMensuel;
    chargesVariables: IChargeVariable[];
}

const HistoryDetailScreen: React.FC = () => {
    const route = useRoute<HistoryDetailRouteProp>();
    const { user } = useAuth()
    const { moisAnnee } = route.params;
    const moisAnneeAfter = dayjs(moisAnnee, 'YYYY-MM').add(1, 'month').format('YYYY-MM');

    const [loading, setLoading] = useState(true);
    const [historicalData, setHistoricalData] = useState<IHistoricalData | null>(null);

    if(!user) {
        return <View style={styles.container}><Text style={styles.errorText}>Utilisateur non authentifié.</Text></View>;
    }

    const currentUser = user.nom; 
    const autreColocataire = currentUser === 'Morgan' ? 'Juliette' : 'Morgan';

    useEffect(() => {
        const loadDetail = async () => {
            setLoading(true);
            try {
                const compteMensuel = await DB.getCompteMensuel(moisAnnee);

                if (!compteMensuel) {
                    setHistoricalData(null);
                    return;
                }

                const variables = await DB.getChargesVariables(moisAnnee);
                
                setHistoricalData({
                    compte: compteMensuel,
                    chargesVariables: variables,
                });
            } catch (error) {
                console.error(`Erreur lors du chargement des détails pour ${moisAnnee}:`, error);
                setHistoricalData(null);
            } finally {
                setLoading(false);
            }
        };
        loadDetail();
    }, [moisAnnee]);

    const calculs: IResultatsCalcul = useCalculs(
        historicalData?.compte || null,
        historicalData?.compte?.chargesFixesSnapshot || [],
        historicalData?.chargesVariables || [],
        currentUser 
    ); 

    if (loading) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#3498db" /></View>;
    }

    if (!historicalData) {
        return <View style={styles.container}><Text style={styles.errorText}>Données de compte non trouvées pour {moisAnnee}.</Text></View>;
    }
    
    const { compte, chargesVariables } = historicalData;
    const { 
        totalChargesFixes,
        soldeFinal,
        detteLoyer,
        detteChargesFixes, 
    } = calculs; 
    
    const formattedDateBuild = dayjs(compte.moisAnnee, 'YYYY-MM')
    .format('MMMM YYYY'); 
    
    const formattedDate = formattedDateBuild.charAt(0).toUpperCase() + formattedDateBuild.slice(1);

    let detteChargesVariables = 0
    if (compte.detteJulietteToMorgan) {
        detteChargesVariables += compte.detteJulietteToMorgan;
    }
    if (compte.detteMorganToJuliette) {
        detteChargesVariables -= compte.detteMorganToJuliette;
    }
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Détails du règlement de {formattedDate}</Text>
            
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏠 Loyer & APL ({moisAnneeAfter})</Text>
                <Text style={styles.detail}>Loyer total: {compte.loyerTotal.toFixed(2)} €</Text>
                <Text style={styles.detail}>APL Morgan: {compte.aplMorgan.toFixed(2)} €</Text>
                <Text style={styles.detail}>APL Juliette: {compte.aplJuliette.toFixed(2)} €</Text>

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Dette Loyer/APL :</Text>
                    <View style={styles.detteContainer}>
                        {detteLoyer > 0 ? (
                            <Text style={styles.dettePayer}>Vous devez {detteLoyer.toFixed(2)} € à {currentUser === 'Morgan' ? 'Juliette' : 'Morgan'}.</Text>
                        ) : detteLoyer < 0 ? (
                            <Text style={styles.detteRecevoir}>{currentUser === 'Morgan' ? 'Juliette' : 'Morgan'} vous doit {Math.abs(detteLoyer).toFixed(2)} €.</Text>
                        ) : (
                            <Text style={styles.detteEquilibre}>Équilibré</Text>
                        )}
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚙️ Charges fixes (Total: {totalChargesFixes.toFixed(2)} €)</Text>
                {compte.chargesFixesSnapshot && compte.chargesFixesSnapshot.map((charge, index) => (
                    <View key={index} style={styles.chargeRow}>
                        <Text style={styles.chargeDescription}>• {charge.nom}</Text>
                        <Text style={styles.chargeMontant}>{charge.montantMensuel.toFixed(2)} €</Text>
                        <Text style={styles.chargePayeur}>{charge.payeur}</Text>
                    </View>
                ))}

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Dette charges fixes :</Text>
                    <View style={styles.detteContainer}>
                        {detteChargesFixes > 0 ? (
                            <Text style={styles.dettePayer}>Vous devez {detteChargesFixes.toFixed(2)} € à {currentUser === 'Morgan' ? 'Juliette' : 'Morgan'}.</Text>
                        ) : detteChargesFixes < 0 ? (
                            <Text style={styles.detteRecevoir}>{currentUser === 'Morgan' ? 'Juliette' : 'Morgan'} vous doit {Math.abs(detteChargesFixes).toFixed(2)} €.</Text>
                        ) : (
                            <Text style={styles.detteEquilibre}>Équilibré</Text>
                        )}
                    </View>
                </View>
            </View>

            <View style={[styles.section]}>
                <Text style={styles.sectionTitle}>🎯 Charges variables</Text>
                <Text style={styles.finalDetail}>Dette Morgan vers Juliette: {compte.detteMorganToJuliette?.toFixed(2) || '0.00'} €</Text>
                <Text style={styles.finalDetail}>Dette Juliette vers Morgan: {compte.detteJulietteToMorgan?.toFixed(2) || '0.00'} €</Text>
                <View style={styles.regularisationSummary}>
                    <Text style={styles.summaryLabel}>Dette charges variables :</Text>
                    <View style={styles.detteContainer}>
                        { (currentUser === 'Morgan' && (compte.detteMorganToJuliette ?? 0) > 0) || (currentUser === 'Juliette' && (compte.detteJulietteToMorgan ?? 0) > 0) ? (
                            <Text style={[styles.detteMessageBase, styles.dettePayer]}>
                                Vous devez {
                                    (currentUser === 'Morgan' ? (compte.detteMorganToJuliette ?? 0) : (compte.detteJulietteToMorgan ?? 0))
                                    .toFixed(2)
                                } € à {currentUser === 'Morgan' ? 'Juliette' : 'Morgan'}.
                            </Text>
                        ) : 
                        
                        (currentUser === 'Morgan' && (compte.detteJulietteToMorgan ?? 0) > 0) || (currentUser === 'Juliette' && (compte.detteMorganToJuliette ?? 0) > 0) ? (
                            <Text style={[styles.detteMessageBase, styles.detteRecevoir]}>
                                {currentUser === 'Morgan' ? 'Juliette' : 'Morgan'} vous doit {
                                    (currentUser === 'Morgan' ? (compte.detteJulietteToMorgan ?? 0) : (compte.detteMorganToJuliette ?? 0))
                                    .toFixed(2)
                                } €.
                            </Text>
                        ) : (
                            <Text style={[styles.detteMessageBase, styles.detteEquilibre]}>Aucun transfert de régularisation enregistré.</Text>
                        )}
                    </View>
                </View>

                
            </View>

            <View style={[styles.section, styles.finalSection]}>
                <Text style={styles.sectionTitle}>💰 Solde final net du mois :</Text>
                {soldeFinal > 0 && (
                    <Text style={[styles.soldeFinal, styles.soldeNoteDebiteur]}>{'-'+Math.abs(soldeFinal).toFixed(2)} €</Text>
                )}  
                {soldeFinal < 0 && (
                    <Text style={[styles.soldeFinal, styles.soldeNoteCrediteur]}>{Math.abs(soldeFinal).toFixed(2)} €</Text>
                )}   
                {soldeFinal == 0 && (
                    <Text style={[styles.soldeFinal, styles.soldeNoteEquilibre]}>{Math.abs(soldeFinal).toFixed(2)} €</Text>
                )}                     
                
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Règlement final net :</Text>
                    <View style={styles.detteContainer}>
                        {soldeFinal > 0 ? (
                            <Text style={[styles.soldeNote, styles.soldeNoteDebiteur]}>
                                Vous devez {soldeFinal.toFixed(2)} € à {autreColocataire}.
                            </Text>
                        ) : soldeFinal < 0 ? (
                            <Text style={[styles.soldeNote, styles.soldeNoteCrediteur]}>
                                {autreColocataire} vous doit {Math.abs(soldeFinal).toFixed(2)} €.
                            </Text>
                        ) : (
                            <Text style={[styles.soldeNote, styles.soldeNoteEquilibre]}>Comptes parfaitement équilibrés.</Text>
                        )}
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

export default HistoryDetailScreen;