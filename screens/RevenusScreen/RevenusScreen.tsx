import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useComptes } from "../../hooks/useComptes";
import { useAuth } from "../../hooks/useAuth";
import { IRevenu, RootStackNavigationProp } from "@/types";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { styles } from "./RevenusScreen.style";
import { useHouseholdUsers } from "../../hooks/useHouseholdUsers";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { useNavigation } from "@react-navigation/native";
import { useCategories } from "../../hooks/useCategories";
import { CategoryPickerModal } from "../RevenuDetail/EditRevenuForm/CategoryPickerModal/CategoryPickerModal";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { ChevronsUpDown } from "lucide-react-native";
import { UniversalDatePicker } from "components/ui/UniversalDatePicker/UniversalDatePicker";
import { useToast } from "hooks/useToast";
import { PeriodPickerModal } from "components/ui/PeriodPickerModal/PeriodPickerModal";
import RevenuItem from "./RevenuItem/RevenuItem";

dayjs.locale("fr");

interface GroupedRevenus {
  date: string;
  revenus: IRevenu[];
}

const RevenusScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();

  const { revenus, isLoadingComptes, currentMonthData, addRevenu } =
    useComptes();
  const { user } = useAuth();
  const toast = useToast();

  if (!user) {
    return <NoAuthenticatedUser />;
  }

  const { householdUsers, getDisplayName } = useHouseholdUsers();
  const { categoriesRevenus, getCategoryRevenuLabel, defaultCategoryRevenu } = useCategories();

  const [description, setDescription] = useState("");
  const [montant, setMontant] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState(
    defaultCategoryRevenu?.id || "cat_autre",
  );
  const [selectedDateReception, setSelectedDateReception] =
    useState<Date>(new Date());

  const [isDateReceptionPickerVisible, setDateReceptionPickerVisibility] =
    useState(false);
  const [filterMois, setFilterMois] = useState<string | null>(null);
  const [filterAnnee, setFilterAnnee] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [isFilterPeriodeModalVisible, setIsFilterPeriodeModalVisible] =
    useState(false);
  const [isFilterCategoryModalVisible, setIsFilterCategoryModalVisible] =
    useState(false);

  useEffect(() => {
    if (categoriesRevenus.length > 0) {
      const defaultCat = categoriesRevenus.find((c) => c.isDefault);
      if (defaultCat) {
        setSelectedCategorie(defaultCat.id);
      }
    }
  }, [categoriesRevenus]);

  const handleOpenDetail = useCallback(
    (revenu: IRevenu) => {
      navigation.navigate("RevenuDetail", {
        revenuId: revenu.id,
        description: revenu.description,
      });
    },
    [navigation],
  );

  const groupedRevenus = useMemo(() => {
    let filtered = revenus.slice();

    if (filterMois) {
      filtered = filtered.filter(
        (r) => dayjs(r.dateReception).format("YYYY-MM") === filterMois,
      );
    }

    if (filterAnnee) {
      filtered = filtered.filter(
        (r) => dayjs(r.dateReception).format("YYYY") === filterAnnee,
      );
    }

    if (filterCategory) {
      filtered = filtered.filter((r) => r.categorie === filterCategory);
    }

    const sortedRevenus = filtered.sort(
      (a, b) =>
        dayjs(b.dateReception).valueOf() -
        dayjs(a.dateReception).valueOf(),
    );

    const groupedData = sortedRevenus.reduce(
      (acc, revenu) => {
        const dateKey = dayjs(revenu.dateReception).format("YYYY-MM-DD");
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(revenu);
        return acc;
      },
      {} as Record<string, IRevenu[]>,
    );

    const groupedArray: GroupedRevenus[] = [];
    const sortedDateKeys = Object.keys(groupedData).sort(
      (a, b) => dayjs(b).valueOf() - dayjs(a).valueOf(),
    );

    sortedDateKeys.forEach((dateKey) => {
      groupedArray.push({
        date: dayjs(dateKey).format("DD MMMM YYYY"),
        revenus: groupedData[dateKey],
      });
    });

    return groupedArray;
  }, [
    revenus,
    filterMois,
    filterAnnee,
    filterCategory,
  ]);

  const handleAddRevenu = useCallback(async () => {
    const montantTotal = parseFloat(montant.replace(",", "."));

    if (!currentMonthData) {
      toast.error(
        "Erreur",
        "Les données mensuelles sont manquantes.",
      );
      return;
    }

    if (!description.trim() || isNaN(montantTotal) || montantTotal <= 0) {
      toast.warning(
        "Erreur de saisie",
        "Veuillez vérifier la description et un montant valide (> 0).",
      );
      return;
    }

    setIsSubmitting(true);

    const revenuToAdd: Omit<IRevenu, "id" | "householdId"> = {
      description: description.trim(),
      montant: montantTotal,
      dateReception: selectedDateReception.toISOString(),
      moisAnnee: dayjs(selectedDateReception).format("YYYY-MM"),
      categorie: selectedCategorie,
      beneficiaire: user.id
    };

    try {
      await addRevenu(revenuToAdd);
      setDescription("");
      setMontant("");
      setSelectedDateReception(new Date());
      setSelectedCategorie(defaultCategoryRevenu?.label || "Autre");
      setShowForm(false);
      toast.success("Succès", "Revenu enregistré.");
    } catch (error) {
      console.error("Erreur Trésorerie:", error);
      toast.error("Erreur", "Échec de l'enregistrement du revenu.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    description,
    montant,
    selectedDateReception,
    selectedCategorie,
    currentMonthData,
    addRevenu,
    user.id,
    householdUsers,
  ]);

  const isSoloHousehold = user.activeHouseholdId === user.id;


  if (isLoadingComptes) {
    return <Text style={styles.loading}>Chargement des revenus...</Text>;
  }

  const currentCategoryData = categoriesRevenus.find(
    (c) => c.id === selectedCategorie,
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>Revenus</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(!showForm)}
          disabled={isSubmitting}
        >
          <Text style={styles.addButtonText}>
            {showForm ? "Annuler l'ajout" : "+ Ajouter un revenu"}
          </Text>
        </TouchableOpacity>

        {showForm && (
          <View style={styles.formContainer}>
            <View style={styles.editSectionCard}>
              <Text style={styles.editLabel}>Titre</Text>
              <View style={styles.inputFieldContainer}>
                <TextInput
                  style={styles.editInputActive}
                  placeholder="Description (ex: Salaire)"
                  placeholderTextColor="#95a5a6"
                  value={description}
                  onChangeText={setDescription}
                  maxLength={30}
                  editable={!isSubmitting}
                />
              </View>
            </View>

            <View style={styles.editSectionCard}>
              <Text style={styles.editLabel}>Montant Total</Text>
              <View style={styles.inputFieldContainer}>
                <TextInput
                  style={styles.editInputActive}
                  placeholder="0.00"
                  placeholderTextColor="#95a5a6"
                  value={montant}
                  onChangeText={setMontant}
                  keyboardType="decimal-pad"
                  {...({ inputMode: "decimal" } as any)}
                  maxLength={8}
                  editable={!isSubmitting}
                />
                <Text
                  style={{ fontSize: 17, fontWeight: "600", marginLeft: 8 }}
                >
                  €
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setIsCategoryModalVisible(true)}
            >
              <Text style={styles.selectorLabel}>Catégorie</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ fontSize: 16, marginRight: 6 }}>
                    {currentCategoryData?.icon || "💵"}
                  </Text>
                  <Text numberOfLines={1} style={{ flexShrink: 1 }}>
                    {currentCategoryData?.label || selectedCategorie}
                  </Text>
                </View>
                <ChevronsUpDown size={14} color="#8E8E93" />
              </View>
            </TouchableOpacity>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <UniversalDatePicker
                date={selectedDateReception}
                label="Date de réception"
                isVisible={isDateReceptionPickerVisible}
                onConfirm={(date: Date) => {
                  setSelectedDateReception(date);
                  setDateReceptionPickerVisibility(false);
                }}
                onCancel={() => setDateReceptionPickerVisibility(false)}
                onOpen={() => setDateReceptionPickerVisibility(true)}
                containerStyle={{ flex: 1, marginLeft: 0 }}
                styles={{
                  ...styles,
                  editSectionCard: styles.selectorButton,
                  editLabel: styles.selectorLabel,
                  selectorContainer: {
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  },
                  miniUserText: { fontSize: 14, color: "#000" },
                }}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                (isSubmitting ||
                  !description ||
                  !montant) &&
                  styles.disabledButton,
              ]}
              onPress={handleAddRevenu}
              disabled={
                isSubmitting ||
                !description ||
                !montant
              }
            >
              <Text style={styles.saveButtonText}>
                {isSubmitting ? "Enregistrement..." : "Enregistrer le revenu"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        <Text style={styles.filtersLabel}>Filtrer :</Text>
        <View style={styles.filtersContainer}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              (filterMois || filterAnnee) && styles.filterChipActive,
            ]}
            onPress={() => setIsFilterPeriodeModalVisible(true)}
          >
            <Text
              style={[
                styles.filterChipText,
                (filterMois || filterAnnee) && styles.filterChipTextActive,
              ]}
            >
              📅{" "}
              {filterMois
                ? dayjs(filterMois).format("MMM YYYY")
                : filterAnnee
                  ? filterAnnee
                  : "Période"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              filterCategory && styles.filterChipActive,
            ]}
            onPress={() => setIsFilterCategoryModalVisible(true)}
          >
            <Text
              style={[
                styles.filterChipText,
                filterCategory && styles.filterChipTextActive,
              ]}
            >
              🏷️{" "}
              {filterCategory ? getCategoryRevenuLabel(filterCategory) : "Catégorie"}
            </Text>
          </TouchableOpacity>

          {(filterMois ||
            filterAnnee ||
            filterCategory) && (
            <TouchableOpacity
              style={styles.filterClearButton}
              onPress={() => {
                setFilterMois(null);
                setFilterAnnee(null);
                setFilterCategory(null);
              }}
            >
              <Text style={styles.filterClearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {groupedRevenus.length === 0 ? (
          <Text style={styles.loading}>
            Aucun revenu enregistré pour le moment.
          </Text>
        ) : (
          groupedRevenus.map((group) => (
            <View key={group.date}>
              <Text style={styles.dateSeparator}>{group.date}</Text>
              {group.revenus.map((revenu) => (
                <RevenuItem
                  key={revenu.id}
                  revenu={revenu}
                  onPress={handleOpenDetail}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <PeriodPickerModal
        isVisible={isFilterPeriodeModalVisible}
        onClose={() => setIsFilterPeriodeModalVisible(false)}
        onSelectMonth={(month) => {
          setFilterAnnee(null);
          setFilterMois(month);
          setIsFilterPeriodeModalVisible(false);
        }}
        onSelectYear={(year) => {
          setFilterMois(null);
          setFilterAnnee(year);
          setIsFilterPeriodeModalVisible(false);
        }}
        selectedMonth={filterMois}
        selectedYear={filterAnnee}
        revenus={revenus}
      />

      <CategoryPickerModal
        isVisible={isFilterCategoryModalVisible}
        onClose={() => setIsFilterCategoryModalVisible(false)}
        selectedId={selectedCategorie}
        categoriesRevenus={categoriesRevenus}
        onSelect={(id) => {
          setFilterCategory(id);
          setIsFilterCategoryModalVisible(false);
        }}
      />

      <CategoryPickerModal
        isVisible={isCategoryModalVisible}
        onClose={() => setIsCategoryModalVisible(false)}
        selectedId={selectedCategorie}
        categoriesRevenus={categoriesRevenus}
        onSelect={(id) => {
          setSelectedCategorie(id);
          setIsCategoryModalVisible(false);
        }}
      />

      <DateTimePickerModal
        isVisible={isDateReceptionPickerVisible}
        mode="date"
        date={selectedDateReception}
        onConfirm={(date) => {
          setSelectedDateReception(date);
          setDateReceptionPickerVisibility(false);
        }}
        onCancel={() => setDateReceptionPickerVisibility(false)}
        confirmTextIOS="Valider"
        cancelTextIOS="Annuler"
        locale="fr_FR"
        isDarkModeEnabled={false}
        textColor="black"
        {...({ themeVariant: "light" } as any)}
      />
    </View>
  );
};

export default RevenusScreen;
