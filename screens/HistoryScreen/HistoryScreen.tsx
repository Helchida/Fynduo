import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useComptes } from "../../hooks/useComptes";
import { RootStackNavigationProp } from "@/types";
import { styles } from "../../styles/screens/HistoryScreen/HistoryScreen.style";
import { common } from "../../styles/common.style";
import { ArrowBigDown, ArrowBigRight, Lightbulb, History } from "lucide-react-native";
import { InfoModal } from "components/ui/InfoModal/InfoModal";
import { useScreenInfo } from "hooks/useScreenInfo";

type GroupedHistory = {
  [year: number]: any[];
};

const groupHistoryByYear = (history: any[]): GroupedHistory => {
  const grouped: GroupedHistory = {};

  history.forEach((monthData) => {
    const year = parseInt(monthData.moisAnnee.substring(0, 4), 10);

    if (!grouped[year]) {
      grouped[year] = [];
    }
    grouped[year].push(monthData);
  });

  Object.keys(grouped).forEach((yearKey) => {
    const year = parseInt(yearKey, 10);
    grouped[year].sort((a, b) => b.moisAnnee.localeCompare(a.moisAnnee));
  });

  return grouped;
};

const getFrenchMonthName = (moisAnnee: string) => {
  const [year, month] = moisAnnee.split("-").map(Number);
  const date = new Date(year, month - 1);

  let monthName = date.toLocaleDateString("fr-FR", { month: "long" });
  return monthName.charAt(0).toUpperCase() + monthName.slice(1);
};

const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { historyMonths, loadHistory, isLoadingComptes } = useComptes();
  const { showInfoModal, setShowInfoModal } = useScreenInfo();

  const [expandedYear, setExpandedYear] = useState<number | null>(null);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const groupedHistory = useMemo(() => {
    return groupHistoryByYear(historyMonths);
  }, [historyMonths]);

  const sortedYears = useMemo(() => {
    return Object.keys(groupedHistory)
      .map(Number)
      .sort((a, b) => b - a);
  }, [groupedHistory]);

  const toggleYear = (year: number) => {
    setExpandedYear(expandedYear === year ? null : year);
  };

  if (isLoadingComptes) {
    return (
      <View style={common.loadingContainer}>
        <ActivityIndicator size="large" color="#2c3e50" />
      </View>
    );
  }

  if (historyMonths.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={common.emptyText}>
          Aucun compte clôturé n'est disponible pour l'instant.
        </Text>
      </View>
    );
  }

  const renderMonthCard = (monthData: any) => (
    <TouchableOpacity
      key={monthData.id}
      style={[styles.monthCard, styles.monthSubCard]}
      onPress={() =>
        navigation.navigate("HistoryDetail", { moisAnnee: monthData.moisAnnee })
      }
    >
      <Text style={styles.monthTitle}>
        {getFrenchMonthName(monthData.moisAnnee)}
      </Text>
      <Text style={styles.statusBadge}>Clôturé</Text>
      <Text style={styles.detailText}>Voir le détail</Text>
    </TouchableOpacity>
  );

  const renderYearPanel = (year: number) => {
    const isExpanded = expandedYear === year;
    const arrow = isExpanded ? "▼" : "►";

    const monthsData = groupedHistory[year];

    return (
      <View key={year} style={styles.yearSection}>
        <TouchableOpacity
          style={styles.yearHeader}
          onPress={() => toggleYear(year)}
        >
          <Text style={styles.yearText}>Année {year}</Text>
          {isExpanded ? (
            <ArrowBigDown size={20} color={"#ffffff"} />
          ) : (
            <ArrowBigRight size={20} color={"#ffffff"} />
          )}
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.yearContent}>
            {monthsData.map(renderMonthCard)}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Comptes clôturés</Text>

      {sortedYears.map(renderYearPanel)}
      <InfoModal
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      >
        <View style={common.centerRow}>
          <History
            size={30}
            color={"#7F8C8D"}
            style={common.infoModalIconTitle}
          />
          <Text style={common.infoModalTitle}>À propos de l'historique</Text>
        </View>

        <Text style={common.infoModalText}>
          L'historique regroupe tous les mois pour lesquels une{" "}
          <Text style={common.bold}>clôture de compte</Text> a été effectuée.
          Ils sont organisés par année.
        </Text>

        <Text style={common.infoModalText}>
          Appuyez sur un mois pour consulter le{" "}
          <Text style={common.bold}>détail de la régularisation</Text> : loyer,
          charges fixes, dépenses variables et solde final entre les membres.
        </Text>

        <View style={[common.infoModalBox, common.trickBox]}>
          <View style={common.row}>
            <Lightbulb
              size={14}
              color={"#004085"}
              style={common.boxIconTitle}
            />
            <Text style={[common.boxTitle, common.trickTitle]}>
              {" "}
              Bon à savoir
            </Text>
          </View>
          <Text style={[common.boxText, common.trickText]}>
            Les données historiques sont en{" "}
            <Text style={common.bold}>lecture seule</Text>. Elles constituent
            une trace fiable de chaque clôture et ne peuvent pas être modifiées.
          </Text>
        </View>
      </InfoModal>
    </ScrollView>
  );
};

export default HistoryScreen;
