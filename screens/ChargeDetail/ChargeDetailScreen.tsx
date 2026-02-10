import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  IChargeFixe,
  IChargeVariable,
  RootStackNavigationProp,
  RootStackRouteProp,
} from "../../types";
import dayjs from "dayjs";
import { styles } from "./ChargeDetailScreen.style";
import "dayjs/locale/fr";
import { useAuth } from "../../hooks/useAuth";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { useHouseholdUsers } from "hooks/useHouseholdUsers";
import { useComptes } from "hooks/useComptes";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { UserDisplayCard } from "./UserDisplayCard/UserDisplayCard";
import { EditChargeForm } from "./EditChargeForm/EditChargeForm";
import { useCategories } from "hooks/useCategories";
import { ConfirmModal } from "components/ui/ConfirmModal/ConfirmModal";
import { useToast } from "hooks/useToast";
import BadgeCharge from "components/fynduo/BadgeCharge/BadgeCharge";
dayjs.locale("fr");

type ChargeDetailRouteProp = RootStackRouteProp<"ChargeDetail">;

const ChargeDetailScreen: React.FC = () => {
  const route = useRoute<ChargeDetailRouteProp>();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { user } = useAuth();
  const toast = useToast();

  if (!user) {
    return <NoAuthenticatedUser />;
  }

  const { chargeId } = route.params;

  const { charges, isLoadingComptes, updateCharge, deleteCharge } =
    useComptes();
  const { householdUsers } = useHouseholdUsers();
  const { categories, defaultCategory } = useCategories();

  const initialCharge = charges.find((c) => c.id === chargeId);

  const [charge, setCharge] = useState<
    (IChargeVariable | IChargeFixe) | undefined
  >(initialCharge);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editDescription, setEditDescription] = useState(
    charge?.description || "",
  );
  const [editMontant, setEditMontant] = useState(
    charge?.montantTotal.toFixed(2).replace(".", ",") || "",
  );
  const [editPayeurUid, setEditPayeurUid] = useState<string | null>(
    charge?.payeur || null,
  );
  const [editBeneficiairesUid, setEditBeneficiairesUid] = useState<string[]>(
    charge?.beneficiaires || [],
  );
  const [isPayeurModalVisible, setIsPayeurModalVisible] = useState(false);
  const [isDateStatistiquesPickerVisible, setDateStatistiquesPickerVisibility] =
    useState(false);
  const [isDateComptesPickerVisible, setDateComptesPickerVisibility] =
    useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [editDateStatistiques, setEditDateStatistiques] = useState<Date>(
    charge?.dateStatistiques ? new Date(charge.dateStatistiques) : new Date(),
  );
  const [editDateComptes, setEditDateComptes] = useState<Date>(
    charge?.dateComptes ? new Date(charge.dateComptes) : new Date(),
  );
  const [editCategorie, setEditCategorie] = useState<string>(
    charge?.categorie || 'cat_autre',
  );
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  const showDateStatistiquesPicker = () =>
    setDateStatistiquesPickerVisibility(true);
  const hideDateStatistiquesPicker = () =>
    setDateStatistiquesPickerVisibility(false);

  const showDateComptesPicker = () => setDateComptesPickerVisibility(true);
  const hideDateComptesPicker = () => setDateComptesPickerVisibility(false);

  const handleConfirmDateStatistiques = (date: Date) => {
    setEditDateStatistiques(date);
    hideDateStatistiquesPicker();
  };

  const handleConfirmDateComptes = (date: Date) => {
    setEditDateComptes(date);
    hideDateComptesPicker();
  };

  const getDisplayName = (uid: string) => {
    const user = householdUsers.find((u) => u.id === uid);
    return user ? user.displayName : "Inconnu";
  };

  useEffect(() => {
    if (initialCharge) {
      setCharge(initialCharge);
      setEditDescription(initialCharge.description);
      setEditMontant(initialCharge.montantTotal.toFixed(2).replace(".", ","));
      setEditPayeurUid(initialCharge.payeur);
      setEditBeneficiairesUid(initialCharge.beneficiaires);

      const categoryExists = categories.some(
        (c) =>
          c.id === initialCharge.categorie,
      );

      if (categoryExists) {
        setEditCategorie(initialCharge.categorie);
      } else if (defaultCategory) {
        setEditCategorie(defaultCategory.id);
      } else {
        setEditCategorie("Autre");
      }

      setEditDateStatistiques(
        initialCharge.dateStatistiques
          ? new Date(initialCharge.dateStatistiques)
          : new Date(),
      );
      setEditDateComptes(
        initialCharge.dateComptes
          ? new Date(initialCharge.dateComptes)
          : new Date(),
      );
    } else if (!isLoadingComptes) {
      toast.success("Succès", "Charge supprimée.");
      navigation.goBack();
    }
  }, [
    initialCharge,
    isLoadingComptes,
    navigation,
    categories,
    defaultCategory,
  ]);

  if (isLoadingComptes || !charge) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const handleUpdateCharge = useCallback(async () => {
    if (!charge || !editPayeurUid) return;

    const montantTotal = parseFloat(editMontant.replace(",", "."));

    if (
      !editDescription.trim() ||
      isNaN(montantTotal) ||
      montantTotal <= 0 ||
      editBeneficiairesUid.length === 0
    ) {
      toast.warning("Erreur de saisie", "Veuillez vérifier tous les champs.");
      return;
    }

    setIsSubmitting(true);

    const updatedDataBase = {
      description: editDescription.trim(),
      montantTotal,
      payeur: editPayeurUid,
      beneficiaires: editBeneficiairesUid,
      dateStatistiques: editDateStatistiques.toISOString(),
      dateComptes: editDateComptes.toISOString(),
    };

    const updatedData: Partial<IChargeVariable & IChargeFixe> = {
      ...updatedDataBase,
      ...({ categorie: editCategorie }),
    } as Partial<IChargeVariable & IChargeFixe>;

    try {
      await updateCharge(charge.id, updatedData);
      toast.success("Succès", "Dépense modifiée.");
      setIsEditing(false);
    } catch (error) {
      toast.error("Erreur", "Échec de la modification.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    charge,
    editDescription,
    editMontant,
    editPayeurUid,
    editBeneficiairesUid,
    editDateStatistiques,
    editDateComptes,
    updateCharge,
    editCategorie,
  ]);

  const handleToggleEditBeneficiaire = (userId: string) => {
    setEditBeneficiairesUid((prev) => {
      if (prev.includes(userId)) {
        if (prev.length === 1) {
          toast.warning(
            "Attention",
            "Il doit y avoir au moins un bénéficiaire.",
          );
          return prev;
        }
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const calculatedSplit = useMemo(() => {
    if (!charge || !householdUsers.length) return [];

    const total = charge.montantTotal;
    const nbBeneficiaires = charge.beneficiaires.length;
    const amountPerPerson = nbBeneficiaires > 0 ? total / nbBeneficiaires : 0;

    return charge.beneficiaires.map((userId) => {
      return {
        userId: userId,
        name: getDisplayName(userId),
        isCurrentUser: userId === user.id,
        isPayeur: charge.payeur === userId,
        amountPerPerson,
      };
    });
  }, [charge, householdUsers, user.id, getDisplayName]);

  const payeurItem = calculatedSplit.find((item) => item.isPayeur) || {
    userId: charge.payeur,
    name: getDisplayName(charge.payeur),
    isCurrentUser: charge.payeur === user.id,
    isPayeur: true,
    amountPerPerson: 0,
  };

  const dateStatistiquesFormatted = dayjs(charge.dateStatistiques).format(
    "DD MMMM YYYY",
  );
  const dateComptesFormatted = dayjs(charge.dateComptes).format("DD MMMM YYYY");

  const benefUids = isEditing ? editBeneficiairesUid : charge.beneficiaires;
  const nbBeneficiaires = benefUids.length;
  const currentCategoryData = categories.find(
    (c) => c.id === charge.categorie,
  );
  const categoryIcon = currentCategoryData ? currentCategoryData.icon : "📦";

  const isActiveHouseholdSolo = user.activeHouseholdId === user.id;
  const isFromSharedHousehold = charge.householdId !== user.id;

  const displayAmountTotal = useMemo(() => {
    if (!initialCharge) return "0,00";
    const amount =
      isActiveHouseholdSolo && isFromSharedHousehold
        ? initialCharge.montantTotal /
          (initialCharge.beneficiaires?.length || 1)
        : initialCharge.montantTotal;
    return amount.toFixed(2).replace(".", ",");
  }, [initialCharge, isActiveHouseholdSolo, isFromSharedHousehold]);

  return (
    <ScrollView style={styles.detailContainer}>
      {isEditing ? (
        <EditChargeForm
          editDescription={editDescription}
          setEditDescription={setEditDescription}
          editMontant={editMontant}
          setEditMontant={setEditMontant}
          editPayeurUid={editPayeurUid}
          setIsPayeurModalVisible={setIsPayeurModalVisible}
          isPayeurModalVisible={isPayeurModalVisible}
          householdUsers={householdUsers}
          getDisplayName={getDisplayName}
          setEditPayeurUid={setEditPayeurUid}
          editDateStatistiques={editDateStatistiques}
          editDateComptes={editDateComptes}
          showDateStatistiquesPicker={showDateStatistiquesPicker}
          showDateComptesPicker={showDateComptesPicker}
          isDateStatistiquesPickerVisible={isDateStatistiquesPickerVisible}
          isDateComptesPickerVisible={isDateComptesPickerVisible}
          handleConfirmDateStatistiques={handleConfirmDateStatistiques}
          handleConfirmDateComptes={handleConfirmDateComptes}
          hideDateStatistiquesPicker={hideDateStatistiquesPicker}
          hideDateComptesPicker={hideDateComptesPicker}
          editBeneficiairesUid={editBeneficiairesUid}
          handleToggleEditBeneficiaire={handleToggleEditBeneficiaire}
          currentUserId={user.id}
          isSubmitting={isSubmitting}
          handleUpdateCharge={handleUpdateCharge}
          setIsEditing={setIsEditing}
          editCategorie={editCategorie}
          setEditCategorie={setEditCategorie}
          isCategoryModalVisible={isCategoryModalVisible}
          setIsCategoryModalVisible={setIsCategoryModalVisible}
          categories={categories}
        />
      ) : (
        <>
          <View style={styles.detailHeaderContainer}>
            <Text style={styles.iconText}>{categoryIcon}</Text>
            <Text style={styles.detailTitle}>{charge.description}</Text>
            {isActiveHouseholdSolo && (
              <BadgeCharge
                chargeScope={charge.scope}
                chargeType={charge.type}
              />
            )}
            <Text style={styles.detailDateText}>
              Dépense du {dateStatistiquesFormatted}
            </Text>
            <Text style={styles.detailDateText}>
              Ajouté le {dateComptesFormatted}
            </Text>
          </View>

          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>
              {isActiveHouseholdSolo && !isFromSharedHousehold
                ? "Payé"
                : "Payé par"}
            </Text>
            <UserDisplayCard
              name={isActiveHouseholdSolo ? user.displayName : payeurItem.name}
              amount={displayAmountTotal}
              isPayeur={true}
              isMe={payeurItem.userId === user.id}
            />
          </View>

          {!isActiveHouseholdSolo && (
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>
                Pour {nbBeneficiaires} participant
                {nbBeneficiaires > 1 ? "s" : ""}
                {nbBeneficiaires > 0 && benefUids.includes(user.id)
                  ? ", y compris toi"
                  : ""}
              </Text>

              {calculatedSplit.map((item) => (
                <UserDisplayCard
                  key={item.userId + "-split"}
                  name={item.name}
                  amount={item.amountPerPerson.toFixed(2).replace(".", ",")}
                  isMe={item.userId === user.id}
                />
              ))}
            </View>
          )}

          {(!isActiveHouseholdSolo ||
            (!isFromSharedHousehold && isActiveHouseholdSolo)) && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  { backgroundColor: "#3498DB", flex: 1, marginRight: 5 },
                ]}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.addButtonText}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  { backgroundColor: "#E74C3C", flex: 1, marginLeft: 5 },
                ]}
                onPress={() => setIsDeleteModalVisible(true)}
              >
                <Text style={styles.addButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          )}

          {isActiveHouseholdSolo && isFromSharedHousehold && (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text
                style={{
                  color: "#7f8c8d",
                  fontStyle: "italic",
                  textAlign: "center",
                }}
              >
                Cette dépense provient d'un foyer partagé. Pour la modifier,
                rendez-vous dans l'espace concerné.
              </Text>
            </View>
          )}

          <ConfirmModal
            visible={isDeleteModalVisible}
            title="Supprimer la charge"
            message={`Voulez-vous vraiment supprimer "${charge.description}" ? Cette action est irréversible.`}
            confirmText="Supprimer"
            isDestructive={true}
            onConfirm={async () => {
              setIsDeleteModalVisible(false);
              deleteCharge(charge.id);
            }}
            onCancel={() => setIsDeleteModalVisible(false)}
          />
        </>
      )}
    </ScrollView>
  );
};

export default ChargeDetailScreen;
