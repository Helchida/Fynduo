import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { useComptes } from "../../hooks/useComptes";
import { useAuth } from "../../hooks/useAuth";
import { styles } from "./ChargesFixesScreen.style";
import { IChargeFixe, IUser } from "@/types";
import * as DB from "../../services/firebase/db";
import ChargeFixeItem from "./ChargeFixeItem/ChargeFixeItem";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { ChevronsUpDown, Info } from "lucide-react-native";
import { useToast } from "hooks/useToast";
import { getDisplayNameUserInHousehold } from "utils/getDisplayNameUserInHousehold";
import { DayPickerModal } from "components/ui/DayPickerModal/DayPickerModal";
import { useChargesFixesConfigs } from "hooks/useChargesFixesConfigs";
import dayjs from "dayjs";
import { CategoryPickerModal } from "screens/ChargeDetail/EditChargeForm/CategoryPickerModal/CategoryPickerModal";
import { useCategories } from "hooks/useCategories";

const ChargesFixesScreen: React.FC = () => {
  const {
    isLoadingComptes,
    chargesFixesConfigs,
    loadConfigs,
    updateChargeFixeConfig,
    updateChargeFixeConfigPayeur,
    updateChargeFixeConfigDay,
    updateChargeFixeConfigCategorie,
    addChargeFixeConfig,
    deleteChargeFixeConfig,
  } = useChargesFixesConfigs();

  const { loadData } = useComptes();

  const { user, householdUsers } = useAuth();
  const { categories, defaultCategory } = useCategories();
  const toast = useToast();
  if (!user) {
    return <NoAuthenticatedUser />;
  }

  const [nom, setNom] = useState("");
  const [montant, setMontant] = useState("");
  const [payeur, setPayeur] = useState<string | null>(user.id);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPayeurModalVisible, setIsPayeurModalVisible] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [jourPrelevement, setJourPrelevement] = useState<number | null>(null);
  const [isDayModalVisible, setIsDayModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState(
    defaultCategory?.id || "Autre",
  );
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  const isSoloMode = user.activeHouseholdId === user.id;

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  useEffect(() => {
    if (categories.length > 0) {
      const defaultCat = categories.find((c) => c.isDefault);
      if (defaultCat) {
        setSelectedCategorie(defaultCat.id);
      }
    }
  }, [categories]);

  const handleChargeUpdate = useCallback(
    async (id: string, newAmount: number) => {
      try {
        await updateChargeFixeConfig(id, newAmount);
        toast.success("Succès", "Charge mise à jour");
      } catch (error) {
        toast.error("Erreur", "Échec de la mise à jour des charges");
        console.error("Erreur Charges:", error);
      }
    },
    [updateChargeFixeConfig],
  );

  const handleChargeUpdatePayeur = useCallback(
    async (chargeId: string, newPayeurUid: string) => {
      try {
        await updateChargeFixeConfigPayeur(chargeId, newPayeurUid);
        toast.success("Succès", "Le payeur a été mis à jour");
      } catch (error) {
        toast.error("Erreur", "Échec de la mise à jour du payeur");
        console.error("Erreur update Payeur:", error);
      }
    },
    [updateChargeFixeConfigPayeur],
  );

  const handleChargeUpdateDay = useCallback(
    async (chargeId: string, newDay: number) => {
      try {
        await updateChargeFixeConfigDay(chargeId, newDay);
        toast.success("Succès", "Le jour de prélèvement a été mis à jour");
      } catch (error) {
        toast.error("Erreur", "Échec de la mise à jour du jour de prélèvement");
        console.error("Erreur update Day:", error);
      }
    },
    [updateChargeFixeConfigDay],
  );

  const handleChargeUpdateCategorie = useCallback(
    async (chargeId: string, newCategorie: string) => {
      try {
        await updateChargeFixeConfigCategorie(chargeId, newCategorie);
      } catch (error) {
        toast.error("Erreur", "Échec de la mise à jour de la catégorie");
      }
    },
    [updateChargeFixeConfigCategorie],
  );

  const handleAddDepense = useCallback(async () => {
    const montantTotal = parseFloat(montant.replace(",", "."));

    if (!payeur) {
      toast.warning(
        "Erreur de saisie",
        "Veuillez sélectionner qui paie cette charge",
      );
      return;
    }

    if (!nom.trim()) {
      toast.warning(
        "Erreur de saisie",
        "Veuillez saisir une description pour la charge",
      );
      return;
    }

    if (isNaN(montantTotal) || montantTotal <= 0) {
      toast.warning(
        "Erreur de saisie",
        "Veuillez saisir un montant supérieur à 0 pour la charge.",
      );
      return;
    }

    if (!jourPrelevement) {
      toast.warning(
        "Erreur de saisie",
        "Veuillez sélectionner un jour de prélèvement pour la charge.",
      );
      return;
    }

    setIsSubmitting(true);

    const chargeFixeToAdd: Omit<IChargeFixe, "id" | "householdId"> = {
      description: nom.trim(),
      montantTotal,
      payeur: payeur,
      beneficiaires: isSoloMode ? [user.id] : householdUsers.map((u) => u.id),
      moisAnnee: dayjs().format("YYYY-MM"),
      jourPrelevementMensuel: jourPrelevement,
      dateComptes: new Date().toISOString(),
      dateStatistiques: new Date().toISOString(),
      categorie: selectedCategorie,
      type: "fixe",
      scope: isSoloMode ? "solo" : "partage",
    };

    try {
      await addChargeFixeConfig(chargeFixeToAdd);
      setNom("");
      setMontant("");
      setPayeur(user?.id || null);
      setShowForm(false);
      setSelectedCategorie(defaultCategory?.id || "Autre");
      toast.success("Succès", "Charge fixe enregistrée");
      const today = dayjs();
      const shouldAutoAdd = jourPrelevement && today.date() >= jourPrelevement;

      if (shouldAutoAdd) {
        setIsRefreshing(true);
        setTimeout(async () => {
          await loadData();
          setIsRefreshing(false);
        }, 800);
      }
    } catch (error) {
      console.error("Erreur charge fixe:", error);
      toast.error("Erreur", "Échec de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    nom,
    montant,
    payeur,
    user,
    jourPrelevement,
    addChargeFixeConfig,
    loadData,
    isSoloMode,
    householdUsers,
    toast,
    selectedCategorie,
  ]);

  const selectPayeur = (uid: string) => {
    setPayeur(uid);
    setIsPayeurModalVisible(false);
  };

  if (isLoadingComptes) {
    return <Text style={styles.loading}>Chargement des charges...</Text>;
  }

  const currentCategoryData = categories.find(
    (c) => c.id === selectedCategorie,
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Charges fixes</Text>
        <TouchableOpacity
          onPress={() => setShowInfoModal(true)}
          style={styles.infoButton}
        >
          <Info size={24} color="#000" />
        </TouchableOpacity>
      </View>
      {isRefreshing && (
        <View style={styles.refreshingBanner}>
          <Text style={styles.refreshingText}>Ajout dans les dépenses...</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowForm(!showForm)}
        disabled={isSubmitting}
      >
        <Text style={styles.addButtonText}>
          {showForm ? "Annuler l'ajout" : "+ Ajouter une charge fixe"}
        </Text>
      </TouchableOpacity>
      {showForm && (
        <View style={styles.formContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Facture Internet"
            placeholderTextColor="#95a5a6"
            value={nom}
            onChangeText={setNom}
            maxLength={30}
            editable={!isSubmitting}
          />
          <Text style={styles.label}>Montant mensuel</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 80.50"
            placeholderTextColor="#95a5a6"
            value={montant}
            onChangeText={setMontant}
            keyboardType="decimal-pad"
            {...({ inputMode: "decimal" } as any)}
            maxLength={8}
            editable={!isSubmitting}
          />
          {!isSoloMode && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Payée par</Text>
              <TouchableOpacity
                style={[styles.input, styles.dropdownInput]}
                onPress={() => setIsPayeurModalVisible(true)}
                disabled={isSubmitting}
              >
                <Text
                  style={!payeur ? styles.placeholderText : styles.inputText}
                >
                  {getDisplayNameUserInHousehold(payeur, householdUsers)}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Jour de prélèvement</Text>
            <TouchableOpacity
              style={[styles.input, styles.dropdownInput]}
              onPress={() => setIsDayModalVisible(true)}
              disabled={isSubmitting}
            >
              <Text
                style={
                  !jourPrelevement ? styles.placeholderText : styles.inputText
                }
              >
                {jourPrelevement ? `Le ${jourPrelevement}` : "Choisir un jour"}
              </Text>
            </TouchableOpacity>
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
                  {currentCategoryData?.icon || "📦"}
                </Text>
                <Text numberOfLines={1} style={{ flexShrink: 1 }}>
                  {currentCategoryData?.label || selectedCategorie}
                </Text>
              </View>
              <ChevronsUpDown size={14} color="#8E8E93" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleAddDepense}
            disabled={isSubmitting}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>
              {isSubmitting
                ? "Enregistrement..."
                : "Enregistrer la charge fixe"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={chargesFixesConfigs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChargeFixeItem
            charge={item}
            onUpdate={handleChargeUpdate}
            onDelete={deleteChargeFixeConfig}
            householdUsers={householdUsers}
            onUpdatePayeur={handleChargeUpdatePayeur}
            onUpdateDay={handleChargeUpdateDay}
            onUpdateCategorie={handleChargeUpdateCategorie}
          />
        )}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      <DayPickerModal
        isVisible={isDayModalVisible}
        onClose={() => setIsDayModalVisible(false)}
        selectedDay={jourPrelevement}
        onSelectDay={setJourPrelevement}
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
      <Modal
        visible={isPayeurModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPayeurModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Sélectionner le payeur</Text>
            <FlatList
              data={householdUsers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    item.id === payeur && styles.modalItemSelected,
                  ]}
                  onPress={() => selectPayeur(item.id)}
                >
                  <Text style={styles.modalItemText}>{item.displayName}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsPayeurModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showInfoModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.infoModalContent}>
            <Text style={styles.infoModalTitle}>
              💡 À propos des charges fixes
            </Text>
            <Text style={styles.infoModalText}>
              Les <Text style={styles.bold}>charges fixes</Text> sont des
              dépenses récurrentes chaque mois : électricité, gaz, internet,
              eau, assurance, etc.
            </Text>
            <Text style={styles.infoModalText}>
              Ces montants sont répartis équitablement entre les colocataires
              lors de la régularisation mensuelle.
            </Text>
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>⚠️ Important</Text>
              <Text style={styles.warningText}>
                Si vous modifiez le montant d'une charge fixe, cela
                <Text style={styles.bold}> n'affecte que les mois futurs</Text>.
              </Text>
              <Text style={styles.warningText}>
                Les mois déjà validés restent inchangés car un historique des
                charges est enregistré à chaque clôture.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.infoModalButton}
              onPress={() => setShowInfoModal(false)}
            >
              <Text style={styles.infoModalButtonText}>Compris !</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ChargesFixesScreen;
