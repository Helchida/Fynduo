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
import { ICharge, RootStackNavigationProp } from "@/types";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { styles } from "../../styles/screens/ChargesScreen/ChargesScreen.style";
import { common } from "../../styles/common.style";
import { useHouseholdUsers } from "../../hooks/useHouseholdUsers";
import ChargeItem from "./ChargeItem/ChargeItem";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { useNavigation } from "@react-navigation/native";
import { useCategories } from "../../hooks/useCategories";
import { CategoryPickerModal } from "../ChargeDetail/EditChargeForm/CategoryPickerModal/CategoryPickerModal";
import { PayeurPickerModal } from "../ChargeDetail/EditChargeForm/PayeurPickerModal/PayeurPickerModal";
import { BeneficiariesSelector } from "../ChargeDetail/EditChargeForm/BeneficiariesSelector/BeneficiariesSelector";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {
  CalendarSearch,
  ChevronsUpDown,
  Puzzle,
  Tag,
  UserRound,
} from "lucide-react-native";
import { UniversalDatePicker } from "components/ui/UniversalDatePicker/UniversalDatePicker";
import { useToast } from "hooks/useToast";
import { PeriodPickerModal } from "components/ui/PeriodPickerModal/PeriodPickerModal";
import { useMultiUserBalance } from "hooks/useMultiUserBalance";
import { calculSimplifiedTransfers } from "utils/calculSimplifiedTransfers";
import { TypeChargePickerModal } from "components/ui/TypeChargePickerModal/TypeChargePickerModal";

dayjs.locale("fr");

interface GroupedCharges {
  date: string;
  charges: ICharge[];
}

const ChargesScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();

  const { charges, isLoadingComptes, addChargeVariable, currentMonthData } =
    useComptes();
  const { user } = useAuth();
  const toast = useToast();

  if (!user) {
    return <NoAuthenticatedUser />;
  }

  const { householdUsers, getDisplayName } = useHouseholdUsers();
  const { categories, getCategoryLabel, defaultCategory } = useCategories();
  const balances = useMultiUserBalance(charges, householdUsers);

  const [description, setDescription] = useState("");
  const [montant, setMontant] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payeurUid, setPayeurUid] = useState<string | null>(user.id || null);
  const [beneficiairesUid, setBeneficiairesUid] = useState<string[]>([]);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isPayeurModalVisible, setIsPayeurModalVisible] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState(
    defaultCategory?.id || "Autre",
  );
  const [selectedDateStatistiques, setSelectedDateStatistiques] =
    useState<Date>(new Date());

  const [isDateStatistiquesPickerVisible, setDateStatistiquesPickerVisibility] =
    useState(false);
  const [filterMois, setFilterMois] = useState<string | null>(null);
  const [filterAnnee, setFilterAnnee] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterPayeur, setFilterPayeur] = useState<string | null>(null);
  const [filterTypeCharge, setFilterTypeCharge] = useState<string | null>(null);
  const [isFilterPeriodeModalVisible, setIsFilterPeriodeModalVisible] =
    useState(false);
  const [isFilterPayeurModalVisible, setIsFilterPayeurModalVisible] =
    useState(false);
  const [isFilterTypeChargeModalVisible, setIsFilterTypeChargeModalVisible] =
    useState(false);
  const [isFilterCategoryModalVisible, setIsFilterCategoryModalVisible] =
    useState(false);

  useEffect(() => {
    if (categories.length > 0) {
      const defaultCat = categories.find((c) => c.isDefault);
      if (defaultCat) {
        setSelectedCategorie(defaultCat.id);
      }
    }
  }, [categories]);

  const handleOpenDetail = useCallback(
    (charge: ICharge) => {
      navigation.navigate("ChargeDetail", {
        chargeId: charge.id,
        description: charge.description,
      });
    },
    [navigation],
  );

  const suggestionsVirements = useMemo(() => {
    return calculSimplifiedTransfers(balances);
  }, [balances]);

  const groupedCharges = useMemo(() => {
    let filtered = charges.slice();

    if (filterPayeur) {
      filtered = filtered.filter((c) => c.payeur === filterPayeur);
    }

    if (filterTypeCharge) {
      filtered = filtered.filter((c) => c.type === filterTypeCharge);
    }

    if (filterMois) {
      filtered = filtered.filter(
        (c) => dayjs(c.dateStatistiques).format("YYYY-MM") === filterMois,
      );
    }

    if (filterAnnee) {
      filtered = filtered.filter(
        (c) => dayjs(c.dateStatistiques).format("YYYY") === filterAnnee,
      );
    }

    if (filterCategory) {
      filtered = filtered.filter((c) => c.categorie === filterCategory);
    }

    const sortedCharges = filtered.sort(
      (a, b) =>
        dayjs(b.dateStatistiques).valueOf() -
        dayjs(a.dateStatistiques).valueOf(),
    );

    const groupedData = sortedCharges.reduce(
      (acc, charge) => {
        const dateKey = dayjs(charge.dateStatistiques).format("YYYY-MM-DD");
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(charge);
        return acc;
      },
      {} as Record<string, ICharge[]>,
    );

    const groupedArray: GroupedCharges[] = [];
    const sortedDateKeys = Object.keys(groupedData).sort(
      (a, b) => dayjs(b).valueOf() - dayjs(a).valueOf(),
    );

    sortedDateKeys.forEach((dateKey) => {
      groupedArray.push({
        date: dayjs(dateKey).format("DD MMMM YYYY"),
        charges: groupedData[dateKey],
      });
    });

    return groupedArray;
  }, [
    charges,
    filterPayeur,
    filterTypeCharge,
    filterMois,
    filterAnnee,
    filterCategory,
  ]);

  const handleAddDepense = useCallback(async () => {
    const montantTotal = parseFloat(montant.replace(",", "."));

    if (!payeurUid || !currentMonthData) {
      toast.error(
        "Erreur",
        "Le payeur ou les données mensuelles sont manquantes.",
      );
      return;
    }

    if (beneficiairesUid.length === 0) {
      toast.warning(
        "Erreur de saisie",
        "Veuillez sélectionner au moins un bénéficiaire.",
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

    const chargeVariableToAdd: Omit<ICharge, "id" | "householdId"> = {
      description: description.trim(),
      montantTotal,
      payeur: payeurUid,
      beneficiaires: beneficiairesUid,
      dateStatistiques: selectedDateStatistiques.toISOString(),
      moisAnnee: dayjs(selectedDateStatistiques).format("YYYY-MM"),
      categorie: selectedCategorie,
      type: "variable",
      scope:
        beneficiairesUid.length > 1 && !isSoloHousehold ? "partage" : "solo",
    };

    try {
      await addChargeVariable(chargeVariableToAdd);
      setDescription("");
      setMontant("");
      setSelectedDateStatistiques(new Date());
      setSelectedCategorie(defaultCategory?.label || "Autre");
      setPayeurUid(user.id || null);
      if (isSoloHousehold) {
        setBeneficiairesUid([user.id]);
      } else {
        setBeneficiairesUid(householdUsers.map((u) => u.id));
      }
      setShowForm(false);
      toast.success("Succès", "Dépense enregistrée.");
    } catch (error) {
      console.error("Erreur Trésorerie:", error);
      toast.error("Erreur", "Échec de l'enregistrement de la dépense.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    description,
    montant,
    payeurUid,
    beneficiairesUid,
    selectedDateStatistiques,
    selectedCategorie,
    currentMonthData,
    addChargeVariable,
    user.id,
    householdUsers,
  ]);

  const isSoloHousehold = user.activeHouseholdId === user.id;

  useEffect(() => {
    if (isSoloHousehold) {
      if (
        beneficiairesUid.length === 0 ||
        !beneficiairesUid.includes(user.id)
      ) {
        setBeneficiairesUid([user.id]);
      }
    } else if (householdUsers.length > 0) {
      if (beneficiairesUid.length === 0) {
        setBeneficiairesUid(householdUsers.map((u) => u.id));
      }
    }
  }, [householdUsers.length, isSoloHousehold, user.id]);

  if (isLoadingComptes) {
    return <Text style={styles.loading}>Chargement des dépenses...</Text>;
  }

  const benefCount = beneficiairesUid.length;
  const currentCategoryData = categories.find(
    (c) => c.id === selectedCategorie,
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>Charges variables</Text>
        <TouchableOpacity
          style={common.addButton}
          onPress={() => setShowForm(!showForm)}
          disabled={isSubmitting}
        >
          <Text style={common.addButtonText}>
            {showForm ? "Annuler l'ajout" : "+ Ajouter une dépense"}
          </Text>
        </TouchableOpacity>

        {showForm && (
          <View style={common.formContainer}>
            <View style={common.formContainer}>
              <Text style={styles.editLabel}>Titre</Text>
              <View style={styles.inputFieldContainer}>
                <TextInput
                  style={styles.editInputActive}
                  placeholder="Description (ex: Courses)"
                  placeholderTextColor="#95a5a6"
                  value={description}
                  onChangeText={setDescription}
                  maxLength={30}
                  editable={!isSubmitting}
                />
              </View>
            </View>

            <View style={common.formContainer}>
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
              style={common.selectorButton}
              onPress={() => setIsCategoryModalVisible(true)}
            >
              <Text style={common.selectorLabel}>Catégorie</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ fontSize: 16, marginRight: 6 }}>
                    {currentCategoryData?.icon || "📦"}
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
                date={selectedDateStatistiques}
                label="Date de dépense"
                isVisible={isDateStatistiquesPickerVisible}
                onConfirm={(date: Date) => {
                  setSelectedDateStatistiques(date);
                  setDateStatistiquesPickerVisibility(false);
                }}
                onCancel={() => setDateStatistiquesPickerVisibility(false)}
                onOpen={() => setDateStatistiquesPickerVisibility(true)}
                containerStyle={{ flex: 1, marginLeft: 0 }}
                styles={{
                  ...styles,
                  formContainer: common.selectorButton,
                  editLabel: common.selectorLabel,
                  selectorContainer: {
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  },
                  miniUserText: { fontSize: 14, color: "#000" },
                }}
              />
            </View>

            {!isSoloHousehold && (
              <>
                <TouchableOpacity
                  style={common.selectorButton}
                  onPress={() => setIsPayeurModalVisible(true)}
                >
                  <Text style={common.selectorLabel}>Payé par</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text>{getDisplayName(payeurUid || "")}</Text>
                    <ChevronsUpDown size={14} color="#8E8E93" />
                  </View>
                </TouchableOpacity>
                <BeneficiariesSelector
                  users={householdUsers}
                  selectedUids={beneficiairesUid}
                  totalAmount={montant}
                  onToggle={(uid) =>
                    setBeneficiairesUid((prev) =>
                      prev.includes(uid)
                        ? prev.filter((i) => i !== uid)
                        : [...prev, uid],
                    )
                  }
                  getDisplayName={getDisplayName}
                  currentUserId={user.id}
                />
              </>
            )}
            <TouchableOpacity
              style={[
                common.saveButton,
                (isSubmitting ||
                  benefCount === 0 ||
                  !payeurUid ||
                  !description ||
                  !montant) &&
                  common.disabledButton,
              ]}
              onPress={handleAddDepense}
              disabled={
                isSubmitting ||
                benefCount === 0 ||
                !payeurUid ||
                !description ||
                !montant
              }
            >
              <Text style={common.saveButtonText}>
                {isSubmitting ? "Enregistrement..." : "Enregistrer la dépense"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {!isSoloHousehold && (
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceTitle}>Equilibrer ?</Text>
            {suggestionsVirements.length === 0 ? (
              <Text style={common.emptyText}>Tout est déjà équilibré ! ✨</Text>
            ) : (
              suggestionsVirements.map((virement, index) => (
                <View key={index} style={styles.virementRow}>
                  <Text style={styles.virementText}>
                    <Text style={common.bold}>
                      {getDisplayName(virement.de)}
                    </Text>{" "}
                    doit envoyer{" "}
                    <Text style={styles.amountText}>
                      {virement.montant.toFixed(2)}€
                    </Text>{" "}
                    à{" "}
                    <Text style={common.bold}>
                      {getDisplayName(virement.a)}
                    </Text>
                  </Text>
                </View>
              ))
            )}
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
            <View style={common.row}>
              <CalendarSearch size={13} color={"#354bbd"} />
              <Text
                style={[
                  styles.filterChipText,
                  (filterMois || filterAnnee) && styles.filterChipTextActive,
                ]}
              >
                {" "}
                {filterMois
                  ? dayjs(filterMois).format("MMM YYYY")
                  : filterAnnee
                    ? filterAnnee
                    : "Période"}
              </Text>
            </View>
          </TouchableOpacity>

          {!isSoloHousehold && (
            <TouchableOpacity
              style={[
                styles.filterChip,
                filterPayeur && styles.filterChipActive,
              ]}
              onPress={() => setIsFilterPayeurModalVisible(true)}
            >
              <View style={common.row}>
                <UserRound size={13} color={"#5c10c0"} />
                <Text
                  style={[
                    styles.filterChipText,
                    filterPayeur && styles.filterChipTextActive,
                  ]}
                >
                  {" "}
                  {filterPayeur ? getDisplayName(filterPayeur) : "Payeur"}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.filterChip,
              filterCategory && styles.filterChipActive,
            ]}
            onPress={() => setIsFilterCategoryModalVisible(true)}
          >
            <View style={common.row}>
              <Tag size={13} color={"#c0ae10"} />
              <Text
                style={[
                  styles.filterChipText,
                  filterCategory && styles.filterChipTextActive,
                ]}
              >
                {" "}
                {filterCategory
                  ? getCategoryLabel(filterCategory)
                  : "Catégorie"}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              filterTypeCharge && styles.filterChipActive,
            ]}
            onPress={() => setIsFilterTypeChargeModalVisible(true)}
          >
            <View style={common.row}>
              <Puzzle size={13} color={"#56c010"} />
              <Text
                style={[
                  styles.filterChipText,
                  filterTypeCharge && styles.filterChipTextActive,
                ]}
              >
                {" "}
                {filterTypeCharge
                  ? filterTypeCharge === "fixe"
                    ? "Fixe"
                    : "Variable"
                  : "Type"}
              </Text>
            </View>
          </TouchableOpacity>

          {(filterMois ||
            filterPayeur ||
            filterAnnee ||
            filterCategory ||
            filterTypeCharge) && (
            <TouchableOpacity
              style={styles.filterClearButton}
              onPress={() => {
                setFilterMois(null);
                setFilterPayeur(null);
                setFilterAnnee(null);
                setFilterCategory(null);
                setFilterTypeCharge(null);
              }}
            >
              <Text style={styles.filterClearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {groupedCharges.length === 0 ? (
          <Text style={styles.loading}>
            Aucune dépense enregistrée pour le moment.
          </Text>
        ) : (
          groupedCharges.map((group) => (
            <View key={group.date}>
              <Text style={styles.dateSeparator}>{group.date}</Text>
              {group.charges.map((charge) => (
                <ChargeItem
                  key={charge.id}
                  charge={charge}
                  householdUsers={householdUsers}
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
        charges={charges}
      />

      <PayeurPickerModal
        isVisible={isFilterPayeurModalVisible}
        onClose={() => setIsFilterPayeurModalVisible(false)}
        users={householdUsers}
        selectedUid={filterPayeur || ""}
        onSelect={(uid) => {
          setFilterPayeur(uid);
          setIsFilterPayeurModalVisible(false);
        }}
        getDisplayName={getDisplayName}
      />

      <TypeChargePickerModal
        isVisible={isFilterTypeChargeModalVisible}
        onClose={() => setIsFilterTypeChargeModalVisible(false)}
        selectedId={filterTypeCharge}
        onSelect={(id) => {
          setFilterTypeCharge(id);
          setIsFilterTypeChargeModalVisible(false);
        }}
      />

      <CategoryPickerModal
        isVisible={isFilterCategoryModalVisible}
        onClose={() => setIsFilterCategoryModalVisible(false)}
        selectedId={selectedCategorie}
        categories={categories}
        onSelect={(id) => {
          setFilterCategory(id);
          setIsFilterCategoryModalVisible(false);
        }}
      />

      <CategoryPickerModal
        isVisible={isCategoryModalVisible}
        onClose={() => setIsCategoryModalVisible(false)}
        selectedId={selectedCategorie}
        categories={categories}
        onSelect={(id) => {
          setSelectedCategorie(id);
          setIsCategoryModalVisible(false);
        }}
      />

      <PayeurPickerModal
        isVisible={isPayeurModalVisible}
        onClose={() => setIsPayeurModalVisible(false)}
        users={householdUsers}
        selectedUid={payeurUid || ""}
        onSelect={(uid) => {
          setPayeurUid(uid);
          setIsPayeurModalVisible(false);
        }}
        getDisplayName={getDisplayName}
      />

      <DateTimePickerModal
        isVisible={isDateStatistiquesPickerVisible}
        mode="date"
        date={selectedDateStatistiques}
        onConfirm={(date) => {
          setSelectedDateStatistiques(date);
          setDateStatistiquesPickerVisibility(false);
        }}
        onCancel={() => setDateStatistiquesPickerVisibility(false)}
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

export default ChargesScreen;
