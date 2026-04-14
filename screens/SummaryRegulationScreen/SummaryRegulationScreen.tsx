import React, { useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useComptes } from "../../hooks/useComptes";
import { useAuth } from "../../hooks/useAuth";
import { useCalculs } from "../../hooks/useCalculs";
import { useHouseholdUsers } from "../../hooks/useHouseholdUsers";
import { styles } from "../../styles/screens/SummaryRegulationScreen/SummaryRegulationScreen.style";
import { common } from "../../styles/common.style";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { InfoModal } from "components/ui/InfoModal/InfoModal";
import { CheckCircle, FileText, Lightbulb } from "lucide-react-native";
import { useScreenInfo } from "hooks/useScreenInfo";

const SummaryRegulationScreen: React.FC = () => {
  const { currentMonthData, isLoadingComptes, charges } = useComptes();

  const { user } = useAuth();

  if (!user) {
    return <NoAuthenticatedUser />;
  }
  const { showInfoModal, setShowInfoModal } = useScreenInfo();

  const { householdUsers, getDisplayName } = useHouseholdUsers();

  const currentUser = user;
  const currentUserUid = currentUser.id || "UID_ACTUEL_INCONNU";
  const otherUser = householdUsers.find((u) => u.id !== currentUserUid);
  const otherUserUid = otherUser?.id || "UID_AUTRE_INCONNU";

  const { soldeFinal, detteLoyer, detteChargesFixes, detteChargesVariables } =
    useCalculs(currentMonthData, charges, currentUserUid);

  const colocataireActuel = getDisplayName(currentUserUid);
  const autreColocataire = getDisplayName(otherUserUid);

  const loyerPayeurUid = currentMonthData?.loyerPayeurUid || otherUserUid;
  const loyerPayeurName = getDisplayName(loyerPayeurUid);

  const { montantAVerserAgence } = useMemo(() => {
    if (!currentMonthData || householdUsers.length === 0)
      return { montantAVerserAgence: 0 };

    const loyerBrut = currentMonthData.loyerTotal;

    const aplTotal = Object.values(currentMonthData.apportsAPL).reduce(
      (sum, apl) => sum + apl,
      0,
    );

    const montantAVerserAgence = loyerBrut - aplTotal;

    return { montantAVerserAgence };
  }, [currentMonthData, householdUsers]);

  if (isLoadingComptes) {
    return (
      <View style={common.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text>Chargement des données...</Text>
      </View>
    );
  }

  if (!currentMonthData || householdUsers.length < 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Aucune donnée disponible pour la régulation.
        </Text>
      </View>
    );
  }

  const estCrediteur = soldeFinal < 0;
  const montantAbsolu = Math.abs(soldeFinal);

  let messagePrincipal = "";

  if (montantAbsolu < 0.01) {
    messagePrincipal =
      "Équilibre parfait ! Aucun remboursement nécessaire entre vous.";
  } else if (estCrediteur) {
    messagePrincipal = `${autreColocataire} doit vous payer ${montantAbsolu.toFixed(
      2,
    )} €`;
  } else {
    messagePrincipal = `Vous devez payer ${montantAbsolu.toFixed(
      2,
    )} € à ${autreColocataire}`;
  }

  const formatDette = (montant: number) => {
    const style = montant > 0 ? styles.detteDebit : styles.detteCredit;
    const signe = montant > 0 ? "-" : "+";
    return (
      <Text style={[styles.detteMontant, style]}>
        {signe}
        {Math.abs(montant).toFixed(2)} €
      </Text>
    );
  };

  const formatMoisAnnee = (dateStr: string) => {
    try {
      const date = new Date(`${dateStr}-01`);

      return new Intl.DateTimeFormat("fr-FR", {
        month: "long",
        year: "numeric",
      })
        .format(date)
        .replace(/^\w/, (c) => c.toUpperCase());
    } catch (e) {
      return dateStr;
    }
  };

  const aplSomme = Object.values(currentMonthData.apportsAPL).reduce(
    (sum, apl) => sum + apl,
    0,
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.headerTitle}>
        {formatMoisAnnee(currentMonthData.moisAnnee)}
      </Text>

      <View style={styles.agenceCard}>
        <Text style={styles.agenceLabel}>Montant du virement à l'agence</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Loyer total</Text>
          {formatDette(currentMonthData.loyerTotal)}
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>APL total</Text>
          {formatDette(-aplSomme)}
        </View>
        <View style={styles.detailSeparator} />
        <View style={styles.detailRow}>
          <Text style={styles.detailTotalLabel}>Solde total à régulariser</Text>
          <Text style={[styles.detteMontant, styles.detailTotalLabel]}>
            {formatDette(montantAVerserAgence)}
          </Text>
        </View>
        <Text style={styles.cardMessage}>
          {loyerPayeurName} doit faire un virement de{" "}
          {montantAVerserAgence.toFixed(2)} € à l'agence.
        </Text>
      </View>

      <View
        style={[
          styles.detailSection,
          estCrediteur ? styles.cardCredit : styles.cardDebit,
        ]}
      >
        <Text style={styles.detailTitle}>
          Analyse détaillée ({colocataireActuel})
        </Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Loyer Net (APL inclus)</Text>
          {formatDette(detteLoyer)}
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Charges Fixes (Élec, Gaz...)</Text>
          {formatDette(detteChargesFixes)}
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            Charges variables (Ajustements)
          </Text>
          {formatDette(detteChargesVariables)}
        </View>

        <View style={styles.detailSeparator} />

        <View style={styles.detailRow}>
          <Text style={styles.detailTotalLabel}>Solde total à régulariser</Text>
          <Text style={[styles.detteMontant, styles.detailTotalLabel]}>
            {formatDette(soldeFinal)}
          </Text>
        </View>
        <Text style={styles.cardMessage}>{messagePrincipal}</Text>
      </View>

      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>
          Statut :{" "}
          {currentMonthData.statut === "finalisé" ? "✅ CLÔTURÉ" : "⚠️ OUVERT"}
        </Text>
      </View>

      <View style={{ height: 30 }} />
      <InfoModal
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      >
        <View style={common.centerRow}>
          <FileText
            size={30}
            color={"#2C3E50"}
            style={common.infoModalIconTitle}
          />
          <Text style={common.infoModalTitle}>À propos du récapitulatif</Text>
        </View>

        <Text style={common.infoModalText}>
          Ce récapitulatif présente le détail complet de la{" "}
          <Text style={common.bold}>régularisation mensuelle</Text> en trois
          sections : loyer (APL inclus), charges fixes et dépenses variables.
        </Text>

        <Text style={common.infoModalText}>
          Pour chacune de ces trois sections, vous voyez le montant que vous{" "}
          <Text style={common.bold}>devez</Text> ou que l'on{" "}
          <Text style={common.bold}>vous doit</Text>, par membre du foyer.
        </Text>

        <View style={[common.infoModalBox, common.successBox]}>
          <View style={common.row}>
            <CheckCircle
              size={14}
              color={"#155724"}
              style={common.boxIconTitle}
            />
            <Text style={[common.boxTitle, common.successTitle]}>
              {" "}
              Solde final
            </Text>
          </View>
          <Text style={[common.boxText, common.successText]}>
            La phrase de synthèse en bas de chaque section indique le{" "}
            <Text style={common.bold}>total net</Text> : qui doit combien à qui,
            toutes catégories confondues.
          </Text>
        </View>

        <View style={[common.infoModalBox, common.trickBox]}>
          <View style={common.row}>
            <Lightbulb
              size={14}
              color={"#004085"}
              style={common.boxIconTitle}
            />
            <Text style={[common.boxTitle, common.trickTitle]}> Astuce</Text>
          </View>
          <Text style={[common.boxText, common.trickText]}>
            Ce récapitulatif est également consultable plus tard depuis l'écran{" "}
            <Text style={common.bold}>Historique</Text> pour chaque mois
            clôturé.
          </Text>
        </View>
      </InfoModal>
    </ScrollView>
  );
};

export default SummaryRegulationScreen;
