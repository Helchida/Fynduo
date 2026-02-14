import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";
import {
  RootStackRouteProp,
  IUser,
  IResultatsCalcul,
  IHistoricalData,
} from "../../types";
import { useCalculs } from "../../hooks/useCalculs";
import * as DB from "../../services/supabase/db";
import dayjs from "dayjs";
import { styles } from "./HistoryDetailScreen.style";
import "dayjs/locale/fr";
import { useAuth } from "../../hooks/useAuth";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { getDisplayNameUserInHousehold } from "utils/getDisplayNameUserInHousehold";
dayjs.locale("fr");

type HistoryDetailRouteProp = RootStackRouteProp<"HistoryDetail">;

const HistoryDetailScreen: React.FC = () => {
  const route = useRoute<HistoryDetailRouteProp>();
  const { user } = useAuth();
  const { moisAnnee } = route.params;
  const moisAnneeAfter = dayjs(moisAnnee, "YYYY-MM")
    .add(1, "month")
    .format("YYYY-MM");

  const [loading, setLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState<IHistoricalData | null>(
    null,
  );
  const [householdUsers, setHouseholdUsers] = useState<IUser[]>([]);

  if (!user) {
    return <NoAuthenticatedUser />;
  }

  const currentUserId = user.id;
  const currentUserDisplay = user.displayName;

  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true);
      try {
        const users = await DB.getHouseholdUsers(user.activeHouseholdId);
        setHouseholdUsers(users);

        const compteMensuel = await DB.getCompteMensuel(
          user.activeHouseholdId,
          moisAnnee,
        );

        if (!compteMensuel) {
          setHistoricalData(null);
          return;
        }

        const variables = await DB.getChargesByType(
          user.activeHouseholdId,
          "variable",
        );

        setHistoricalData({
          compteMensuel: compteMensuel,
          charges: variables,
        });
      } catch (error) {
        console.error(
          `Erreur lors du chargement des détails pour ${moisAnnee}:`,
          error,
        );
        setHistoricalData(null);
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [moisAnnee, user.activeHouseholdId]);

  const calculs: IResultatsCalcul = useCalculs(
    historicalData?.compteMensuel || null,
    historicalData?.charges || [],
    currentUserId,
  );

  if (loading || householdUsers.length === 0 || !historicalData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  const autreColocataireDisplay =
    householdUsers.find((u) => u.id !== currentUserId)?.displayName ||
    currentUserDisplay;

  const { compteMensuel } = historicalData;
  const { totalChargesFixes, soldeFinal, detteLoyer, detteChargesFixes } =
    calculs;

  const aplSomme = Object.values(compteMensuel.apportsAPL).reduce(
    (sum, apl) => sum + apl,
    0,
  );
  const montantAVerserAgence = compteMensuel.loyerTotal - aplSomme;
  const loyerPayeurName = getDisplayNameUserInHousehold(
    compteMensuel.loyerPayeurUid,
    householdUsers,
  );

  const formattedDateBuild = dayjs(compteMensuel.moisAnnee, "YYYY-MM").format(
    "MMMM YYYY",
  );

  const formattedDate =
    formattedDateBuild.charAt(0).toUpperCase() + formattedDateBuild.slice(1);

  const detteVersAutre =
    compteMensuel.dettes.find(
      (d) =>
        d.debiteurUid === currentUserId && d.creancierUid !== currentUserId,
    )?.montant ?? 0;

  const detteParAutre =
    compteMensuel.dettes.find(
      (d) =>
        d.debiteurUid !== currentUserId && d.creancierUid === currentUserId,
    )?.montant ?? 0;

  const soldeVariableNet = detteVersAutre - detteParAutre;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Détails du règlement de {formattedDate}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          🏠 Loyer & APL ({moisAnneeAfter})
        </Text>
        <View style={styles.chargeRow}>
          <Text style={styles.chargeDescription}>• Loyer total</Text>
          <Text style={styles.chargeMontant}>
            {compteMensuel.loyerTotal.toFixed(2)} €
          </Text>
        </View>
        {Object.keys(compteMensuel.apportsAPL).map((uid) => (
          <View key={uid} style={styles.chargeRow}>
            <Text style={styles.chargeDescription}>
              • APL {getDisplayNameUserInHousehold(uid, householdUsers)}
            </Text>
            <Text style={styles.chargeMontant}>
              {compteMensuel.apportsAPL[uid].toFixed(2)} €
            </Text>
          </View>
        ))}
        <View style={styles.chargeRow}>
          <Text style={styles.chargeDescription}>• APL total</Text>
          <Text style={styles.chargeMontant}>{aplSomme.toFixed(2)} €</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Dette Loyer/APL :</Text>
          <View style={styles.detteContainer}>
            {detteLoyer > 0 ? (
              <Text style={styles.dettePayer}>
                Vous devez {detteLoyer.toFixed(2)} € à {autreColocataireDisplay}
                .
              </Text>
            ) : detteLoyer < 0 ? (
              <Text style={styles.detteRecevoir}>
                {autreColocataireDisplay} vous doit{" "}
                {Math.abs(detteLoyer).toFixed(2)} €.
              </Text>
            ) : (
              <Text style={styles.detteEquilibre}>Équilibré</Text>
            )}
          </View>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Montant à verser :</Text>
        </View>
        <Text style={[styles.detail, styles.dettePayer]}>
          {loyerPayeurName} doit verser {montantAVerserAgence.toFixed(2)} € à
          l'agence.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          ⚙️ Charges fixes (Total: {totalChargesFixes.toFixed(2)} €)
        </Text>
        {compteMensuel.chargesFixesSnapshot &&
          compteMensuel.chargesFixesSnapshot.map((charge, index) => (
            <View key={index} style={styles.chargeRow}>
              <Text style={styles.chargeDescription}>
                • {charge.description}
              </Text>
              <Text style={styles.chargeMontant}>
                {charge.montantTotal.toFixed(2)} €
              </Text>
              <Text style={styles.chargePayeur}>
                {getDisplayNameUserInHousehold(charge.payeur, householdUsers)}
              </Text>
            </View>
          ))}

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Dette charges fixes :</Text>
          <View style={styles.detteContainer}>
            {detteChargesFixes > 0 ? (
              <Text style={styles.dettePayer}>
                Vous devez {detteChargesFixes.toFixed(2)} € à{" "}
                {autreColocataireDisplay}.
              </Text>
            ) : detteChargesFixes < 0 ? (
              <Text style={styles.detteRecevoir}>
                {autreColocataireDisplay} vous doit{" "}
                {Math.abs(detteChargesFixes).toFixed(2)} €.
              </Text>
            ) : (
              <Text style={styles.detteEquilibre}>Équilibré</Text>
            )}
          </View>
        </View>
      </View>

      <View style={[styles.section]}>
        <Text style={styles.sectionTitle}>🎯 Charges variables</Text>
        {compteMensuel.dettes.map((dette, index) => (
          <Text key={index} style={styles.finalDetail}>
            Dette{" "}
            {getDisplayNameUserInHousehold(dette.debiteurUid, householdUsers)}{" "}
            vers{" "}
            {getDisplayNameUserInHousehold(dette.creancierUid, householdUsers)}:{" "}
            {dette.montant.toFixed(2)} €
          </Text>
        ))}

        <View style={styles.regularisationSummary}>
          <Text style={styles.summaryLabel}>Dette charges variables :</Text>
          <View style={styles.detteContainer}>
            {soldeVariableNet > 0 ? (
              <Text style={[styles.detteMessageBase, styles.dettePayer]}>
                Vous devez {soldeVariableNet.toFixed(2)} € à{" "}
                {autreColocataireDisplay}.
              </Text>
            ) : soldeVariableNet < 0 ? (
              <Text style={[styles.detteMessageBase, styles.detteRecevoir]}>
                {autreColocataireDisplay} vous doit{" "}
                {Math.abs(soldeVariableNet).toFixed(2)} €.
              </Text>
            ) : (
              <Text style={[styles.detteMessageBase, styles.detteEquilibre]}>
                Aucun transfert de régularisation enregistré.
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={[styles.section, styles.finalSection]}>
        <Text style={styles.sectionTitle}>💰 Solde final net du mois :</Text>
        {soldeFinal > 0 && (
          <Text style={[styles.soldeFinal, styles.soldeNoteDebiteur]}>
            {"-" + Math.abs(soldeFinal).toFixed(2)} €
          </Text>
        )}
        {soldeFinal < 0 && (
          <Text style={[styles.soldeFinal, styles.soldeNoteCrediteur]}>
            {Math.abs(soldeFinal).toFixed(2)} €
          </Text>
        )}
        {soldeFinal == 0 && (
          <Text style={[styles.soldeFinal, styles.soldeNoteEquilibre]}>
            {Math.abs(soldeFinal).toFixed(2)} €
          </Text>
        )}

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Règlement final net :</Text>
          <View style={styles.detteContainer}>
            {soldeFinal > 0 ? (
              <Text style={[styles.soldeNote, styles.soldeNoteDebiteur]}>
                Vous devez {soldeFinal.toFixed(2)} € à {autreColocataireDisplay}
                .
              </Text>
            ) : soldeFinal < 0 ? (
              <Text style={[styles.soldeNote, styles.soldeNoteCrediteur]}>
                {autreColocataireDisplay} vous doit{" "}
                {Math.abs(soldeFinal).toFixed(2)} €.
              </Text>
            ) : (
              <Text style={[styles.soldeNote, styles.soldeNoteEquilibre]}>
                Comptes parfaitement équilibrés.
              </Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default HistoryDetailScreen;
