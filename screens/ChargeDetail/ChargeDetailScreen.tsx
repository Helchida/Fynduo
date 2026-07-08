import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ICharge,
  ChargeScope,
  RootStackNavigationProp,
  RootStackRouteProp,
} from "../../types";
import dayjs from "dayjs";
import { styles } from "../../styles/screens/ChargeDetailScreen/ChargeDetailScreen.style";
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
import { calculateRepartition } from "../../utils/repartition";
dayjs.locale("fr");

type ChargeDetailRouteProp = RootStackRouteProp<"ChargeDetail">;

function parseRepartition(
  raw: ICharge["repartition"],
): Record<string, number> | null {
  if (!raw) return null;
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (e) {
    console.error("Erreur de parsing de la répartition :", e);
    return null;
  }
}

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

  const [charge, setCharge] = useState<ICharge | undefined>(initialCharge);
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
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [editDateStatistiques, setEditDateStatistiques] = useState<Date>(
    charge?.dateStatistiques ? new Date(charge.dateStatistiques) : new Date(),
  );
  const [editCategorie, setEditCategorie] = useState<string>(
    charge?.categorie || 'cat_autre',
  );
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [editSplitMode, setEditSplitMode] = useState<"egal" | "part">(
    parseRepartition(charge?.repartition) ? "part" : "egal",
  );
  const [editLockedMontants, setEditLockedMontants] = useState<
    Record<string, number>
  >(parseRepartition(charge?.repartition) || {});

  const showDateStatistiquesPicker = () =>
    setDateStatistiquesPickerVisibility(true);
  const hideDateStatistiquesPicker = () =>
    setDateStatistiquesPickerVisibility(false);

  const handleConfirmDateStatistiques = (date: Date) => {
    setEditDateStatistiques(date);
    hideDateStatistiquesPicker();
  };

  const getDisplayName = useCallback((uid: string) => {
    const userItem = householdUsers.find((u) => u.id === uid);
    return userItem ? userItem.displayName : "Inconnu";
  }, [householdUsers]);

  const repartitionMap = useMemo(
    () => parseRepartition(charge?.repartition),
    [charge?.repartition],
  );

  const editAmountNum = parseFloat(editMontant.replace(",", ".")) || 0;

  const { montants: editRepartition, error: editRepartitionError } = useMemo(
    () =>
      calculateRepartition(
        editBeneficiairesUid,
        editAmountNum,
        editLockedMontants,
      ),
    [editBeneficiairesUid, editAmountNum, editLockedMontants],
  );

  useEffect(() => {
    if (initialCharge) {
      setCharge(initialCharge);
      setEditDescription(initialCharge.description);
      setEditMontant(initialCharge.montantTotal.toFixed(2).replace(".", ","));
      setEditPayeurUid(initialCharge.payeur);
      setEditBeneficiairesUid(initialCharge.beneficiaires);

      const initialRepartition = parseRepartition(initialCharge.repartition);
      setEditSplitMode(initialRepartition ? "part" : "egal");
      setEditLockedMontants(initialRepartition || {});

      const categoryExists = categories.some(
        (c) => c.id === initialCharge.categorie,
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
    toast,
  ]);

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

    if (editSplitMode === "part" && editRepartitionError) {
      toast.warning("Erreur de répartition", editRepartitionError);
      return;
    }

    setIsSubmitting(true);

    const chargeScope: ChargeScope = editBeneficiairesUid.length > 1 ? "partage" : "solo";

    const finalRepartition = editSplitMode === "egal" ? null : editRepartition;

    const updatedData: Partial<ICharge> = {
      description: editDescription.trim(),
      montantTotal,
      payeur: editPayeurUid,
      beneficiaires: editBeneficiairesUid,
      dateStatistiques: editDateStatistiques.toISOString(),
      moisAnnee: dayjs(editDateStatistiques).format("YYYY-MM"),
      scope: chargeScope,
      categorie: editCategorie,
      repartition: finalRepartition, 
    };

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
    updateCharge,
    editCategorie,
    toast,
    editSplitMode,        
    editRepartition,      
    editRepartitionError, 
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

    setEditLockedMontants((prev) => {
      const { [userId]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleChangeEditMontant = useCallback((uid: string, montant: number) => {
    setEditLockedMontants((prev) => ({ ...prev, [uid]: montant }));
  }, []);

  const handleChangeEditTaux = useCallback(
    (uid: string, taux: number) => {
      setEditLockedMontants((prev) => ({
        ...prev,
        [uid]: (taux / 100) * editAmountNum,
      }));
    },
    [editAmountNum],
  );

  const handleResetEditRepartition = useCallback(() => {
    setEditLockedMontants({});
  }, []);

  const handleEditSplitModeChange = useCallback((mode: "egal" | "part") => {
    setEditSplitMode(mode);
    if (mode === "egal") setEditLockedMontants({});
  }, []);

  const calculatedSplit = useMemo(() => {
    if (!charge || !householdUsers.length) return [];

    const total = charge.montantTotal;
    const nbBeneficiaires = charge.beneficiaires.length;
    const equitableAmount = nbBeneficiaires > 0 ? total / nbBeneficiaires : 0;

    return charge.beneficiaires.map((userId) => {
      const amountPerPerson =
        repartitionMap && repartitionMap[userId] !== undefined
          ? repartitionMap[userId]
          : equitableAmount;

      return {
        userId: userId,
        name: getDisplayName(userId),
        isCurrentUser: userId === user.id,
        isPayeur: charge.payeur === userId,
        amountPerPerson,
      };
    });
  }, [charge, householdUsers, user.id, getDisplayName, repartitionMap]);

  const payeurItem = calculatedSplit.find((item) => item.isPayeur) || {
    userId: charge?.payeur || "",
    name: getDisplayName(charge?.payeur || ""),
    isCurrentUser: charge?.payeur === user.id,
    isPayeur: true,
    amountPerPerson: 0,
  };

  if (isLoadingComptes || !charge) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const dateStatistiquesFormatted = dayjs(charge.dateStatistiques).format(
    "DD MMMM YYYY",
  );

  const benefUids = isEditing ? editBeneficiairesUid : charge.beneficiaires;
  const nbBeneficiaires = benefUids.length;
  const currentCategoryData = categories.find(
    (c) => c.id === charge.categorie,
  );
  const categoryIcon = currentCategoryData ? currentCategoryData.icon : "📦";

  const isActiveHouseholdSolo = user.activeHouseholdId === user.id;
  const isFromSharedHousehold = charge.householdId !== user.id;

  const displayAmountTotal = (() => {
    if (!initialCharge) return "0,00";

    if (isActiveHouseholdSolo && isFromSharedHousehold) {
      if (repartitionMap && repartitionMap[user.id] !== undefined) {
        return repartitionMap[user.id].toFixed(2).replace(".", ",");
      }
      const amount = initialCharge.montantTotal / (initialCharge.beneficiaires?.length || 1);
      return amount.toFixed(2).replace(".", ",");
    }

    return initialCharge.montantTotal.toFixed(2).replace(".", ",");
  })();

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
          showDateStatistiquesPicker={showDateStatistiquesPicker}
          isDateStatistiquesPickerVisible={isDateStatistiquesPickerVisible}
          handleConfirmDateStatistiques={handleConfirmDateStatistiques}
          hideDateStatistiquesPicker={hideDateStatistiquesPicker}
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
          editSplitMode={editSplitMode}
          setEditSplitMode={handleEditSplitModeChange}
          editRepartition={editRepartition}
          editLockedUids={Object.keys(editLockedMontants)}
          handleChangeEditMontant={handleChangeEditMontant}
          handleChangeEditTaux={handleChangeEditTaux}
          handleResetEditRepartition={handleResetEditRepartition}
          editRepartitionError={editRepartitionError}
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
                chargeNature={charge.nature}
              />
            )}
            <Text style={styles.detailDateText}>
              Dépense du {dateStatistiquesFormatted}
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