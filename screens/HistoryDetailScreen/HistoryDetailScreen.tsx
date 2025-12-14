import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { RootStackRouteProp, ICompteMensuel, IChargeVariable, IUser, IResultatsCalcul, IHistoricalData } from '../../types';
import { useCalculs } from '../../hooks/useCalculs';
import * as DB from '../../services/firebase/db';
import dayjs from 'dayjs';
import { styles } from './HistoryDetailScreen.style';
import 'dayjs/locale/fr';
import { useAuth } from '../../hooks/useAuth';
dayjs.locale('fr');

type HistoryDetailRouteProp = RootStackRouteProp<'HistoryDetail'>;

const HistoryDetailScreen: React.FC = () => {
    const route = useRoute<HistoryDetailRouteProp>();
    const { user } = useAuth()
    const { moisAnnee } = route.params;
    const moisAnneeAfter = dayjs(moisAnnee, 'YYYY-MM').add(1, 'month').format('YYYY-MM');

    const [loading, setLoading] = useState(true);
    const [historicalData, setHistoricalData] = useState<IHistoricalData | null>(null);
    const [householdUsers, setHouseholdUsers] = useState<IUser[]>([]);

    

    if(!user) {
        return <View style={styles.container}><Text style={styles.errorText}>Utilisateur non authentifié.</Text></View>;
    }

    const currentUserId = user.id;
    const currentUserDisplay = user.displayName;



    useEffect(() => {
        const loadDetail = async () => {
            setLoading(true);
            try {

                const users = await DB.getHouseholdUsers(user.householdId);
                setHouseholdUsers(users);

                const compteMensuel = await DB.getCompteMensuel(user.householdId, moisAnnee);

                if (!compteMensuel) {
                    setHistoricalData(null);
                    return;
                }

                const variables = await DB.getChargesVariables(user.householdId);
                
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
    }, [moisAnnee, user.householdId]);

    const calculs: IResultatsCalcul = useCalculs(
        historicalData?.compte || null,
        historicalData?.compte?.chargesFixesSnapshot || [],
        historicalData?.chargesVariables || [],
        currentUserId 
    ); 


    if (loading || householdUsers.length === 0 || !historicalData) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#3498db" /></View>;
    }

    const getUserDisplay = (uid: string): string => {
        const userFound = householdUsers.find(u => u.id === uid);
        if(!userFound){
            console.error(`UID ${uid} non trouvé dans householdUsers lors du rendu.`);
            return '';
        }
        return userFound.displayName;
    };

    const autreColocataireDisplay = householdUsers.find(u => u.id !== currentUserId)?.displayName || currentUserDisplay;
    
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

    const detteVersAutre = compte.dettes.find(d => 
        d.debiteurUid === currentUserId && d.creancierUid !== currentUserId
    )?.montant ?? 0;
    
    const detteParAutre = compte.dettes.find(d => 
        d.debiteurUid !== currentUserId && d.creancierUid === currentUserId
    )?.montant ?? 0;

    const soldeVariableNet = detteVersAutre - detteParAutre;

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Détails du règlement de {formattedDate}</Text>
            
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏠 Loyer & APL ({moisAnneeAfter})</Text>
                <Text style={styles.detail}>Loyer total: {compte.loyerTotal.toFixed(2)} €</Text>
                {Object.keys(compte.apportsAPL).map((uid) => (
                    <Text key={uid} style={styles.detail}>
                        APL {getUserDisplay(uid)}: {compte.apportsAPL[uid].toFixed(2)} €
                    </Text>
                ))}

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Dette Loyer/APL :</Text>
                    <View style={styles.detteContainer}>
                        {detteLoyer > 0 ? (
                            <Text style={styles.dettePayer}>Vous devez {detteLoyer.toFixed(2)} € à {autreColocataireDisplay}.</Text>
                        ) : detteLoyer < 0 ? (
                            <Text style={styles.detteRecevoir}>{autreColocataireDisplay} vous doit {Math.abs(detteLoyer).toFixed(2)} €.</Text>
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
                        <Text style={styles.chargePayeur}>{getUserDisplay(charge.payeur)}</Text>
                    </View>
                ))}

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Dette charges fixes :</Text>
                    <View style={styles.detteContainer}>
                        {detteChargesFixes > 0 ? (
                            <Text style={styles.dettePayer}>Vous devez {detteChargesFixes.toFixed(2)} € à {autreColocataireDisplay}.</Text>
                        ) : detteChargesFixes < 0 ? (
                            <Text style={styles.detteRecevoir}>{autreColocataireDisplay} vous doit {Math.abs(detteChargesFixes).toFixed(2)} €.</Text>
                        ) : (
                            <Text style={styles.detteEquilibre}>Équilibré</Text>
                        )}
                    </View>
                </View>
            </View>

            <View style={[styles.section]}>
                <Text style={styles.sectionTitle}>🎯 Charges variables</Text>
                {compte.dettes.map((dette, index) => (
                    <Text key={index} style={styles.finalDetail}>
                        Dette {getUserDisplay(dette.debiteurUid)} vers {getUserDisplay(dette.creancierUid)}: {dette.montant.toFixed(2)} €
                    </Text>
                ))}
                
                <View style={styles.regularisationSummary}>
                    <Text style={styles.summaryLabel}>Dette charges variables :</Text>
                    <View style={styles.detteContainer}>
                        {soldeVariableNet > 0 ? (
                            <Text style={[styles.detteMessageBase, styles.dettePayer]}>
                                Vous devez {soldeVariableNet.toFixed(2)} € à {autreColocataireDisplay}.
                            </Text>
                        ) : soldeVariableNet < 0 ? (
                            <Text style={[styles.detteMessageBase, styles.detteRecevoir]}>
                                {autreColocataireDisplay} vous doit {Math.abs(soldeVariableNet).toFixed(2)} €.
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
                                Vous devez {soldeFinal.toFixed(2)} € à {autreColocataireDisplay}.
                            </Text>
                        ) : soldeFinal < 0 ? (
                            <Text style={[styles.soldeNote, styles.soldeNoteCrediteur]}>
                                {autreColocataireDisplay} vous doit {Math.abs(soldeFinal).toFixed(2)} €.
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