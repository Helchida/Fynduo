import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  IChargeVariable,
  RootStackNavigationProp,
  RootStackRouteProp,
} from "../../types";
import dayjs from "dayjs";
import { styles } from "./ChargeVariableDetailScreen.style";
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
import { EditChargeVariableForm } from "./EditChargeVariableForm/EditChargeVariableForm";
import { useCategories } from "hooks/useCategories";
import { ConfirmModal } from "components/ui/ConfirmModal/ConfirmModal";
import { useToast } from "hooks/useToast";
dayjs.locale("fr");

type ChargeVariableDetailRouteProp = RootStackRouteProp<"ChargeVariableDetail">;

const ChargeVariableDetailScreen: React.FC = () => {
  const route = useRoute<ChargeVariableDetailRouteProp>();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { user } = useAuth();
  const toast = useToast();

  if (!user) {
    return <NoAuthenticatedUser />;
  }

  const { chargeId } = route.params;

  const {
    chargesVariables,
    isLoadingComptes,
    updateChargeVariable,
    deleteChargeVariable,
  } = useComptes();
  const { householdUsers } = useHouseholdUsers();
  const { categories } = useCategories(user.householdId);

  const initialCharge = chargesVariables.find((c) => c.id === chargeId);

  const [charge, setCharge] = useState<IChargeVariable | undefined>(
    initialCharge
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editDescription, setEditDescription] = useState(
    charge?.description || ""
  );
  const [editMontant, setEditMontant] = useState(
    charge?.montantTotal.toFixed(2).replace(".", ",") || ""
  );
  const [editPayeurUid, setEditPayeurUid] = useState<string | null>(
    charge?.payeur || null
  );
  const [editBeneficiairesUid, setEditBeneficiairesUid] = useState<string[]>(
    charge?.beneficiaires || []
  );
  const [isPayeurModalVisible, setIsPayeurModalVisible] = useState(false);
  const [isDateStatistiquesPickerVisible, setDateStatistiquesPickerVisibility] =
    useState(false);
  const [isDateComptesPickerVisible, setDateComptesPickerVisibility] =
    useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [editDateStatistiques, setEditDateStatistiques] = useState<Date>(
    charge?.dateStatistiques ? new Date(charge.dateStatistiques) : new Date()
  );
  const [editDateComptes, setEditDateComptes] = useState<Date>(
    charge?.dateComptes ? new Date(charge.dateComptes) : new Date()
  );
  const [editCategorie, setEditCategorie] = useState<string>(
    charge?.categorie ? charge.categorie : "Autre"
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
      setEditCategorie(initialCharge.categorie);
      setEditDateStatistiques(
        initialCharge.dateStatistiques
          ? new Date(initialCharge.dateStatistiques)
          : new Date()
      );
      setEditDateComptes(
        initialCharge.dateComptes
          ? new Date(initialCharge.dateComptes)
          : new Date()
      );
    } else if (!isLoadingComptes) {
      toast.error("Erreur", "Charge non trouvée.");
      navigation.goBack();
    }
  }, [initialCharge, isLoadingComptes, navigation]);

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

    const updatedData: Partial<IChargeVariable> = {
      description: editDescription.trim(),
      montantTotal,
      payeur: editPayeurUid,
      beneficiaires: editBeneficiairesUid,
      dateStatistiques: editDateStatistiques.toISOString(),
      dateComptes: editDateComptes.toISOString(),
      categorie: editCategorie,
    };

    try {
      await updateChargeVariable(charge.id, updatedData);
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
    updateChargeVariable,
    editCategorie,
  ]);

  const handleToggleEditBeneficiaire = (userId: string) => {
    setEditBeneficiairesUid((prev) => {
      if (prev.includes(userId)) {
        if (prev.length === 1) {
          toast.warning(
            "Attention",
            "Il doit y avoir au moins un bénéficiaire."
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
    "DD MMMM YYYY"
  );
  const dateComptesFormatted = dayjs(charge.dateComptes).format("DD MMMM YYYY");

  const benefUids = isEditing ? editBeneficiairesUid : charge.beneficiaires;
  const nbBeneficiaires = benefUids.length;
  const currentCategoryData = categories.find((c) => c.id === charge.categorie);
  const categoryIcon = currentCategoryData ? currentCategoryData.icon : "📦";

  return (
    <ScrollView style={styles.detailContainer}>
      {isEditing ? (
        <EditChargeVariableForm
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
            <Text style={styles.detailDateText}>
              Dépense du {dateStatistiquesFormatted}
            </Text>
            <Text
              style={[styles.detailDateText, { fontSize: 12, color: "#999" }]}
            >
              Ajoutée le {dateComptesFormatted}
            </Text>
          </View>

          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Payé par</Text>
            <UserDisplayCard
              name={payeurItem.name}
              amount={charge.montantTotal.toFixed(2).replace(".", ",")}
              isPayeur={true}
              isMe={payeurItem.userId === user.id}
            />
          </View>

          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>
              Pour {nbBeneficiaires} participant{nbBeneficiaires > 1 ? "s" : ""}
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

          <ConfirmModal
            visible={isDeleteModalVisible}
            title="Supprimer la charge"
            message={`Voulez-vous vraiment supprimer "${charge.description}" ? Cette action est irréversible.`}
            confirmText="Supprimer"
            isDestructive={true}
            onConfirm={async () => {
              setIsDeleteModalVisible(false);
              deleteChargeVariable(charge.id);
            }}
            onCancel={() => setIsDeleteModalVisible(false)}
          />
        </>
      )}
    </ScrollView>
  );
};

export default ChargeVariableDetailScreen;
