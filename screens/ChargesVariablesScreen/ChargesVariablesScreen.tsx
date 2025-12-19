import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useComptes } from "../../hooks/useComptes";
import { useAuth } from "../../hooks/useAuth";
import { IChargeVariable, RootStackNavigationProp } from "@/types";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { styles } from "./ChargesVariablesScreen.style";
import { useHouseholdUsers } from "../../hooks/useHouseholdUsers";
import ChargeVariableItem from "./ChargeVariableItem/ChargeVariableItem";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { useNavigation } from "@react-navigation/native";
import { useCategories } from "../../hooks/useCategories";
import { CategoryPickerModal } from "../ChargeVariableDetail/EditChargeVariableForm/CategoryPickerModal/CategoryPickerModal";
import { PayeurPickerModal } from "../ChargeVariableDetail/EditChargeVariableForm/PayeurPickerModal/PayeurPickerModal";
import { BeneficiariesSelector } from "../ChargeVariableDetail/EditChargeVariableForm/BeneficiariesSelector/BeneficiariesSelector";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { ChevronsUpDown } from "lucide-react-native";
import { UniversalDatePicker } from "components/ui/UniversalDatePicker/UniversalDatePicker";

dayjs.locale("fr");

interface GroupedChargesVariables {
  date: string;
  charges: IChargeVariable[];
}

const ChargesVariablesScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();

  const {
    chargesVariables,
    isLoadingComptes,
    addChargeVariable,
    currentMonthData,
  } = useComptes();
  const { user } = useAuth();

  if (!user) {
    return <NoAuthenticatedUser />;
  }

  const { householdUsers, getDisplayName } = useHouseholdUsers();
  const { categories, isLoadingCategories } = useCategories(user.householdId);

  const [description, setDescription] = useState("");
  const [montant, setMontant] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payeurUid, setPayeurUid] = useState<string | null>(user.id || null);
  const [beneficiairesUid, setBeneficiairesUid] = useState<string[]>([]);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isPayeurModalVisible, setIsPayeurModalVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState("Autre");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleOpenDetail = useCallback(
    (charge: IChargeVariable) => {
      navigation.navigate("ChargeVariableDetail", {
        chargeId: charge.id,
        description: charge.description,
      });
    },
    [navigation]
  );

  const groupedCharges = useMemo(() => {
    const sortedCharges = chargesVariables
      .slice()
      .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

    const groupedData = sortedCharges.reduce((acc, charge) => {
      const dateKey = dayjs(charge.date).format("YYYY-MM-DD");
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(charge);
      return acc;
    }, {} as Record<string, IChargeVariable[]>);

    const groupedArray: GroupedChargesVariables[] = [];
    const sortedDateKeys = Object.keys(groupedData).sort(
      (a, b) => dayjs(b).valueOf() - dayjs(a).valueOf()
    );

    sortedDateKeys.forEach((dateKey) => {
      groupedArray.push({
        date: dayjs(dateKey).format("DD MMMM YYYY"),
        charges: groupedData[dateKey],
      });
    });

    return groupedArray;
  }, [chargesVariables]);

  const handleAddDepense = useCallback(async () => {
    const montantTotal = parseFloat(montant.replace(",", "."));

    if (!payeurUid || !currentMonthData) {
      Alert.alert(
        "Erreur",
        "Le payeur ou les données mensuelles sont manquantes."
      );
      return;
    }

    if (beneficiairesUid.length === 0) {
      Alert.alert(
        "Erreur de saisie",
        "Veuillez sélectionner au moins un bénéficiaire."
      );
      return;
    }

    if (!description.trim() || isNaN(montantTotal) || montantTotal <= 0) {
      Alert.alert(
        "Erreur de saisie",
        "Veuillez vérifier la description et un montant valide (> 0)."
      );
      return;
    }

    setIsSubmitting(true);

    const chargeVariableToAdd: Omit<IChargeVariable, "id" | "householdId"> = {
      description: description.trim(),
      montantTotal,
      payeur: payeurUid,
      beneficiaires: beneficiairesUid,
      date: selectedDate.toISOString(),
      moisAnnee: dayjs(selectedDate).format("YYYY-MM"),
      categorie: selectedCategorie,
    };

    try {
      await addChargeVariable(chargeVariableToAdd);
      setDescription("");
      setMontant("");
      setSelectedDate(new Date());
      setSelectedCategorie("Autre");
      setPayeurUid(user.id || null);
      setBeneficiairesUid(householdUsers.map((u) => u.id));
      setShowForm(false);
      Alert.alert("Succès", "Dépense enregistrée.");
    } catch (error) {
      console.error("Erreur Trésorerie:", error);
      Alert.alert("Erreur", "Échec de l'enregistrement de la dépense.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    description,
    montant,
    payeurUid,
    beneficiairesUid,
    selectedDate,
    selectedCategorie,
    currentMonthData,
    addChargeVariable,
    user.id,
    householdUsers,
  ]);

  useEffect(() => {
    if (householdUsers.length > 0) {
      if (beneficiairesUid.length === 0) {
        setBeneficiairesUid(householdUsers.map((u) => u.id));
      }
      if (user.id && !payeurUid) {
        setPayeurUid(user.id);
      }
    }
  }, [householdUsers, beneficiairesUid.length, user.id, payeurUid]);

  if (isLoadingComptes) {
    return <Text style={styles.loading}>Chargement des dépenses...</Text>;
  }

  const benefCount = beneficiairesUid.length;
  const currentCategoryData = categories.find(
    (c) => c.id === selectedCategorie
  );

  const renderGroupedCharge = ({
    item: group,
  }: {
    item: GroupedChargesVariables;
  }) => (
    <View key={group.date}>
      <Text style={styles.dateSeparator}>{group.date}</Text>
      {group.charges.map((charge) => (
        <ChargeVariableItem
          key={charge.id}
          charge={charge}
          householdUsers={householdUsers}
          onPress={handleOpenDetail}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Charges variables</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowForm(!showForm)}
        disabled={isSubmitting}
      >
        <Text style={styles.addButtonText}>
          {showForm ? "Annuler l'ajout" : "+ Ajouter une dépense"}
        </Text>
      </TouchableOpacity>

      {showForm && (
        <View style={styles.formContainer}>
          <View style={styles.editSectionCard}>
            <Text style={styles.editLabel}>Titre</Text>
            <View style={styles.inputFieldContainer}>
              <TextInput
                style={styles.editInputActive}
                placeholder="Description (ex: Courses)"
                value={description}
                onChangeText={setDescription}
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
                value={montant}
                onChangeText={setMontant}
                keyboardType="decimal-pad"
                {...({ inputMode: "decimal" } as any)}
                editable={!isSubmitting}
              />
              <Text style={{ fontSize: 17, fontWeight: "600", marginLeft: 8 }}>
                €
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", marginBottom: 12 }}>
            <TouchableOpacity
              style={[styles.selectorButton, { flex: 1, marginRight: 5 }]}
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
                    {currentCategoryData?.icon || "📦"}
                  </Text>
                  <Text numberOfLines={1} style={{ flexShrink: 1 }}>
                    {currentCategoryData?.label || selectedCategorie}
                  </Text>
                </View>
                <ChevronsUpDown size={14} color="#8E8E93" />
              </View>
            </TouchableOpacity>

            <UniversalDatePicker
              date={selectedDate}
              isVisible={isDatePickerVisible}
              onConfirm={(date: Date) => {
                setSelectedDate(date);
                setDatePickerVisibility(false);
              }}
              onCancel={() => setDatePickerVisibility(false)}
              onOpen={() => setDatePickerVisibility(true)}
              styles={{
                ...styles,
                editSectionCard: { ...styles.selectorButton },
                editLabel: styles.selectorLabel,
                selectorContainer: {
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                },
              }}
            />
          </View>

          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setIsPayeurModalVisible(true)}
          >
            <Text style={styles.selectorLabel}>Payé par</Text>
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
                  : [...prev, uid]
              )
            }
            getDisplayName={getDisplayName}
            currentUserId={user.id}
          />
          <TouchableOpacity
            style={[
              styles.saveButton,
              (isSubmitting || benefCount === 0 || !payeurUid) &&
                styles.disabledButton,
            ]}
            onPress={handleAddDepense}
            disabled={isSubmitting || benefCount === 0 || !payeurUid}
          >
            <Text style={styles.saveButtonText}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer la dépense"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {groupedCharges.length === 0 ? (
        <Text style={styles.loading}>
          Aucune dépense enregistrée pour le moment.
        </Text>
      ) : (
        <FlatList
          data={groupedCharges}
          keyExtractor={(item) => item.date}
          renderItem={renderGroupedCharge}
          style={styles.list}
          contentContainerStyle={{ paddingBottom: 10 }}
        />
      )}

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
        isVisible={isDatePickerVisible}
        mode="date"
        date={selectedDate}
        onConfirm={(date) => {
          setSelectedDate(date);
          setDatePickerVisibility(false);
        }}
        onCancel={() => setDatePickerVisibility(false)}
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

export default ChargesVariablesScreen;
