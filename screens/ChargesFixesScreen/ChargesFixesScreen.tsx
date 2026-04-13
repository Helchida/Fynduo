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
import { styles } from "./../../styles/screens/ChargesFixesScreen/ChargesFixesScreen.style";
import { common } from "../../styles/common.style";
import ChargeFixeItem from "./ChargeFixeItem/ChargeFixeItem";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { ChevronsUpDown, Lightbulb, TriangleAlert } from "lucide-react-native";
import { useToast } from "hooks/useToast";
import { getDisplayNameUserInHousehold } from "utils/getDisplayNameUserInHousehold";
import { DayPickerModal } from "components/ui/DayPickerModal/DayPickerModal";
import { useChargesFixesConfigs } from "hooks/useChargesFixesConfigs";
import dayjs from "dayjs";
import { CategoryPickerModal } from "screens/ChargeDetail/EditChargeForm/CategoryPickerModal/CategoryPickerModal";
import { useCategories } from "hooks/useCategories";
import { IChargeFixeTemplate } from "@/types";
import { useScreenInfo } from "hooks/useScreenInfo";
import { InfoModal } from "components/ui/InfoModal/InfoModal";

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
  const { showInfoModal, setShowInfoModal } = useScreenInfo();

  const [nom, setNom] = useState("");
  const [montant, setMontant] = useState("");
  const [payeur, setPayeur] = useState<string | null>(user.id);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPayeurModalVisible, setIsPayeurModalVisible] = useState(false);
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

    const chargeFixeToAdd: Omit<IChargeFixeTemplate, "id" | "householdId"> = {
      description: nom.trim(),
      montantTotal,
      payeur: payeur,
      beneficiaires: isSoloMode ? [user.id] : householdUsers.map((u) => u.id),
      jourPrelevementMensuel: jourPrelevement,
      categorie: selectedCategorie,
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
      </View>
      {isRefreshing && (
        <View style={styles.refreshingBanner}>
          <Text style={styles.refreshingText}>Ajout dans les dépenses...</Text>
        </View>
      )}
      <TouchableOpacity
        style={common.addButton}
        onPress={() => setShowForm(!showForm)}
        disabled={isSubmitting}
      >
        <Text style={common.addButtonText}>
          {showForm ? "Annuler l'ajout" : "+ Ajouter une charge fixe"}
        </Text>
      </TouchableOpacity>
      {showForm && (
        <View style={common.formContainer}>
          <Text style={common.label}>Description</Text>
          <TextInput
            style={common.input}
            placeholder="Ex: Facture Internet"
            placeholderTextColor="#95a5a6"
            value={nom}
            onChangeText={setNom}
            maxLength={30}
            editable={!isSubmitting}
          />
          <Text style={common.label}>Montant mensuel</Text>
          <TextInput
            style={common.input}
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
            <View style={common.inputGroup}>
              <Text style={common.label}>Payée par</Text>
              <TouchableOpacity
                style={[common.input, styles.dropdownInput]}
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
          <View style={common.inputGroup}>
            <Text style={common.label}>Jour de prélèvement</Text>
            <TouchableOpacity
              style={[common.input, styles.dropdownInput]}
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
          <TouchableOpacity
            onPress={handleAddDepense}
            disabled={isSubmitting}
            style={common.addButton}
          >
            <Text style={common.addButtonText}>
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
        <View style={common.modalOverlay}>
          <View style={common.modalContent}>
            <Text style={common.modalTitle}>Sélectionner le payeur</Text>
            <FlatList
              data={householdUsers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    common.modalItem,
                    item.id === payeur && common.modalItemSelected,
                  ]}
                  onPress={() => selectPayeur(item.id)}
                >
                  <Text style={common.modalItemText}>{item.displayName}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={common.separator} />}
            />
            <TouchableOpacity
              style={common.modalCloseButton}
              onPress={() => setIsPayeurModalVisible(false)}
            >
              <Text style={common.modalCloseButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <InfoModal
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      >
        <View style={common.centerRow}>
          <Lightbulb size={30} color={"#d6d43d"} style={common.infoModalIconTitle} />
          <Text style={common.infoModalTitle}>À propos des charges fixes</Text>
        </View>
        <Text style={common.infoModalText}>
          Les <Text style={common.bold}>charges fixes</Text> sont des dépenses
          récurrentes chaque mois : électricité, gaz, internet, eau, assurance, etc.
        </Text>
        <Text style={common.infoModalText}>
          Ces charges seront ajoutées <Text style={common.bold}>automatiquement</Text> à la liste de vos dépenses selon la date choisie. 
        </Text>
        {!isSoloMode && <Text style={common.infoModalText}>
          Ces montants sont répartis <Text style={common.bold}>équitablement</Text> entre les colocataires lors de
          la <Text style={common.bold}>régularisation mensuelle</Text>.
        </Text>}
        <View style={[common.infoModalBox,common.warningBox]}>
          <View style={common.row}>
            <TriangleAlert size={14} color={"#d82007"} style={common.boxIconTitle} />
            <Text style={[common.boxTitle, common.warningTitle]}> Important</Text>
          </View>
          <Text style={[common.boxText,common.warningText]}>
            Si vous modifiez le montant d'une charge fixe, cela
            <Text style={common.bold}> n'affecte que les mois futurs</Text>.
          </Text>
          {!isSoloMode && <Text style={[common.boxText, common.warningText]}>
            Les mois déjà validés restent inchangés car un historique des charges
            est enregistré à chaque clôture.
          </Text>}
        </View>
      </InfoModal>
    </View>
  );
};

export default ChargesFixesScreen;
