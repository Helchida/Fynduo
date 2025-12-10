import React, { useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useComptes } from '../hooks/useComptes';
import { useAuth } from '../hooks/useAuth';
import { Colocataire } from '../types';
import { styles } from '../styles/screens/SummaryRegulationScreen.style';

const SummaryRegulationScreen: React.FC = () => {
    
    const {
        currentMonthData,
        isLoadingComptes,
        soldeFinal,
        detteLoyer,
        detteChargesFixes,
        detteChargesVariables,
    } = useComptes();

    const { user } = useAuth();
    
    const colocataireActuel: Colocataire = user?.nom || 'Juliette'; 
    const autreColocataire: Colocataire = colocataireActuel === 'Morgan' ? 'Juliette' : 'Morgan';
    
    
    const { montantAVerserAgence } = useMemo(() => {
        if (!currentMonthData) return { montantAVerserAgence: 0 };
        const loyerBrut = currentMonthData.loyerTotal;
        const aplTotal = currentMonthData.aplMorgan + currentMonthData.aplJuliette;

        const montantAVerserAgence = loyerBrut - aplTotal;

        return { montantAVerserAgence };
    }, [currentMonthData]);


    if (isLoadingComptes) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3498db" />
                <Text>Chargement des données...</Text>
            </View>
        );
    }

    if (!currentMonthData) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Aucune donnée disponible.</Text>
            </View>
        );
    }
    
    const estCrediteur = soldeFinal < 0;
    const montantAbsolu = Math.abs(soldeFinal);
    
    let messagePrincipal = '';

    if (montantAbsolu < 0.01) {
        messagePrincipal = "Équilibre parfait ! Aucun remboursement nécessaire entre vous.";
    } else if (estCrediteur) {
        messagePrincipal = `${autreColocataire} doit vous payer ${montantAbsolu.toFixed(2)} €`;
    } else {
        messagePrincipal = `Vous devez payer ${montantAbsolu.toFixed(2)} € à ${autreColocataire}`;
    }

    const formatDette = (montant: number) => {
        const style = montant > 0 ? styles.detteDebit : styles.detteCredit;
        const signe = montant > 0 ? '-' : '+';
        return (
            <Text style={[styles.detteMontant, style]}>
                {signe}{Math.abs(montant).toFixed(2)} €
            </Text>
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            
            <Text style={styles.headerTitle}>Résumé du mois : {currentMonthData.moisAnnee}</Text>
            
            <View style={styles.agenceCard}>
                <Text style={styles.agenceLabel}>Montant du virement à l'agence</Text>
                <Text style={styles.agenceMontant}>
                    {montantAVerserAgence.toFixed(2)} €
                </Text>
                <Text style={styles.agenceMessage}>
                    (Loyer total: {currentMonthData.loyerTotal.toFixed(2)} € - APL total: {(currentMonthData.aplMorgan + currentMonthData.aplJuliette).toFixed(2)} €)
                </Text>
                <Text style={styles.agenceNote}>
                    ⚠️ Ce virement est effectué par Morgan à l'agence.
                </Text>
            </View>

            <View style={[styles.card, estCrediteur ? styles.cardCredit : styles.cardDebit]}>
                <Text style={styles.cardLabel}>Résultat clôture ({colocataireActuel})</Text>
                <Text style={styles.mainSolde}>
                    {montantAbsolu.toFixed(2)} €
                </Text>
                <Text style={styles.cardMessage}>{messagePrincipal}</Text>
            </View>

            <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                    Statut : {currentMonthData.statut === 'finalisé' ? '✅ CLÔTURÉ' : '⚠️ OUVERT'}
                </Text>
            </View>

            <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Analyse détaillée ({colocataireActuel})</Text>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Loyer Net (APL inclus)</Text>
                    {formatDette(detteLoyer)}
                </View>
                
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Charges Fixes (Élec, Gaz...)</Text>
                    {formatDette(detteChargesFixes)}
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Charges variables (Ajustements)</Text>
                    {formatDette(detteChargesVariables)}
                </View>

                <View style={styles.detailSeparator} />
                
                <View style={styles.detailRow}>
                    <Text style={styles.detailTotalLabel}>Solde total à régulariser</Text>
                    <Text style={[styles.detteMontant, styles.detailTotalLabel]}>
                        {formatDette(soldeFinal)}
                    </Text>
                </View>
            </View>
            
            <View style={{ height: 30 }} />
        </ScrollView>
    );
};

export default SummaryRegulationScreen;