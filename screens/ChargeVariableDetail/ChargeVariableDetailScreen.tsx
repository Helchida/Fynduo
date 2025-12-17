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
  Alert,
} from "react-native";
import { useHouseholdUsers } from "hooks/useHouseholdUsers";
import { useComptes } from "hooks/useComptes";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { UserDisplayCard } from "./UserDisplayCard/UserDisplayCard";
import { EditChargeVariableForm } from "./EditChargeVariableForm/EditChargeVariableForm";
dayjs.locale("fr");

type ChargeVariableDetailRouteProp = RootStackRouteProp<"ChargeVariableDetail">;

const ChargeVariableDetailScreen: React.FC = () => {
  const route = useRoute<ChargeVariableDetailRouteProp>();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { user } = useAuth();

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
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [editDate, setEditDate] = useState<Date>(
    charge?.date ? new Date(charge.date) : new Date()
  );

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirmDate = (date: Date) => {
    setEditDate(date);
    hideDatePicker();
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
    } else if (!isLoadingComptes) {
      Alert.alert("Erreur", "Charge non trouvée.");
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

  const handleDeleteCharge = useCallback(async () => {
    if (!charge) return;

    Alert.alert(
      "Confirmation",
      `Êtes-vous sûr de vouloir supprimer la dépense: "${charge.description}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            setIsSubmitting(true);
            try {
              await deleteChargeVariable(charge.id);
              Alert.alert("Succès", "Dépense supprimée.");
              navigation.goBack();
            } catch (error) {
              Alert.alert("Erreur", "Échec de la suppression.");
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  }, [charge, deleteChargeVariable, navigation]);

  const handleUpdateCharge = useCallback(async () => {
    if (!charge || !editPayeurUid) return;

    const montantTotal = parseFloat(editMontant.replace(",", "."));

    if (
      !editDescription.trim() ||
      isNaN(montantTotal) ||
      montantTotal <= 0 ||
      editBeneficiairesUid.length === 0
    ) {
      Alert.alert("Erreur de saisie", "Veuillez vérifier tous les champs.");
      return;
    }

    setIsSubmitting(true);

    const updatedData: Partial<IChargeVariable> = {
      description: editDescription.trim(),
      montantTotal,
      payeur: editPayeurUid,
      beneficiaires: editBeneficiairesUid,
      date: editDate.toISOString(),
    };

    try {
      await updateChargeVariable(charge.id, updatedData);
      Alert.alert("Succès", "Dépense modifiée.");
      setIsEditing(false);
    } catch (error) {
      Alert.alert("Erreur", "Échec de la modification.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    charge,
    editDescription,
    editMontant,
    editPayeurUid,
    editBeneficiairesUid,
    editDate,
    updateChargeVariable,
  ]);

  const handleToggleEditBeneficiaire = (userId: string) => {
    setEditBeneficiairesUid((prev) => {
      if (prev.includes(userId)) {
        if (prev.length === 1) {
          Alert.alert("Attention", "Il doit y avoir au moins un bénéficiaire.");
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
        amountDisplay: amountPerPerson,
      };
    });
  }, [charge, householdUsers, user.id, getDisplayName]);

  const payeurItem = calculatedSplit.find((item) => item.isPayeur) || {
    userId: charge.payeur,
    name: getDisplayName(charge.payeur),
    isCurrentUser: charge.payeur === user.id,
    isPayeur: true,
    amountDisplay: 0,
  };
  const dateFormatted = dayjs(charge.date).format("DD MMMM");
  const benefUids = isEditing ? editBeneficiairesUid : charge.beneficiaires;
  const nbBeneficiaires = benefUids.length;

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
          editDate={editDate}
          showDatePicker={showDatePicker}
          isDatePickerVisible={isDatePickerVisible}
          handleConfirmDate={handleConfirmDate}
          hideDatePicker={hideDatePicker}
          editBeneficiairesUid={editBeneficiairesUid}
          handleToggleEditBeneficiaire={handleToggleEditBeneficiaire}
          currentUserId={user.id}
          isSubmitting={isSubmitting}
          handleUpdateCharge={handleUpdateCharge}
          setIsEditing={setIsEditing}
        />
      ) : (
        <>
          <View style={styles.detailHeaderContainer}>
            <View style={styles.iconPlaceholder}>
              <Text style={styles.iconText}>🛒</Text>
            </View>
            <Text style={styles.detailTitle}>{charge.description}</Text>
            <Text style={styles.detailDateText}>Ajouté le {dateFormatted}</Text>
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
                amount={item.amountDisplay.toFixed(2).replace(".", ",")}
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
              onPress={handleDeleteCharge}
            >
              <Text style={styles.addButtonText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default ChargeVariableDetailScreen;
