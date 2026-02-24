import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  IRevenu,
  RootStackNavigationProp,
  RootStackRouteProp,
} from "../../types";
import dayjs from "dayjs";
import { styles } from "./RevenuDetailScreen.style";
import "dayjs/locale/fr";
import { useAuth } from "../../hooks/useAuth";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { useComptes } from "hooks/useComptes";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { EditRevenuForm } from "./EditRevenuForm/EditRevenuForm";
import { useCategories } from "hooks/useCategories";
import { ConfirmModal } from "components/ui/ConfirmModal/ConfirmModal";
import { useToast } from "hooks/useToast";
dayjs.locale("fr");

type RevenuDetailRouteProp = RootStackRouteProp<"RevenuDetail">;

const RevenuDetailScreen: React.FC = () => {
  const route = useRoute<RevenuDetailRouteProp>();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { user } = useAuth();
  const toast = useToast();

  if (!user) {
    return <NoAuthenticatedUser />;
  }

  const { revenuId } = route.params;

  const { revenus, isLoadingComptes, updateRevenu, deleteRevenu } =
    useComptes();
  const { categoriesRevenus, defaultCategory } = useCategories();

  const initialRevenu = revenus.find((r) => r.id === revenuId);

  const [revenu, setRevenu] = useState<IRevenu | undefined>(initialRevenu);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editDescription, setEditDescription] = useState(
    revenu?.description || "",
  );
  const [editMontant, setEditMontant] = useState(
    revenu?.montant.toFixed(2).replace(".", ",") || "",
  );

  const [isDateReceptionPickerVisible, setDateReceptionPickerVisibility] =
    useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [editDateReception, setEditDateReception] = useState<Date>(
    revenu?.dateReception ? new Date(revenu.dateReception) : new Date(),
  );
  const [editCategorie, setEditCategorie] = useState<string>(
    revenu?.categorie || "cat_autre",
  );
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  const showDateReceptionPicker = () => setDateReceptionPickerVisibility(true);
  const hideDateReceptionPicker = () => setDateReceptionPickerVisibility(false);

  const handleConfirmDateReception = (date: Date) => {
    setEditDateReception(date);
    hideDateReceptionPicker();
  };

  useEffect(() => {
    if (initialRevenu) {
      setRevenu(initialRevenu);
      setEditDescription(initialRevenu.description);
      setEditMontant(initialRevenu.montant.toFixed(2).replace(".", ","));

      const categoryExists = categoriesRevenus.some(
        (c) => c.id === initialRevenu.categorie,
      );

      if (categoryExists) {
        setEditCategorie(initialRevenu.categorie);
      } else if (defaultCategory) {
        setEditCategorie(defaultCategory.id);
      } else {
        setEditCategorie("cat_autre");
      }

      setEditDateReception(
        initialRevenu.dateReception
          ? new Date(initialRevenu.dateReception)
          : new Date(),
      );
    } else if (!isLoadingComptes) {
      toast.success("Succès", "Revenu supprimé.");
      navigation.goBack();
    }
  }, [
    initialRevenu,
    isLoadingComptes,
    navigation,
    categoriesRevenus,
    defaultCategory,
  ]);

  if (isLoadingComptes || !revenu) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const handleUpdateRevenu = useCallback(async () => {
    if (!revenu) return;

    const montantTotal = parseFloat(editMontant.replace(",", "."));

    if (!editDescription.trim() || isNaN(montantTotal) || montantTotal <= 0) {
      toast.warning("Erreur de saisie", "Veuillez vérifier tous les champs.");
      return;
    }

    setIsSubmitting(true);

    const updatedDataBase = {
      description: editDescription.trim(),
      montant: montantTotal,
      dateReception: editDateReception.toISOString(),
      moisAnnee: dayjs(editDateReception).format("YYYY-MM"),
    };

    const updatedData: Partial<IRevenu> = {
      ...updatedDataBase,
      ...{ categorie: editCategorie },
    } as Partial<IRevenu>;

    try {
      await updateRevenu(revenu.id, updatedData);
      toast.success("Succès", "Revenu modifié.");
      setIsEditing(false);
    } catch (error) {
      toast.error("Erreur", "Échec de la modification.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    revenu,
    editDescription,
    editMontant,
    editDateReception,
    updateRevenu,
    editCategorie,
  ]);

  const dateReceptionFormatted = dayjs(revenu.dateReception).format(
    "DD MMMM YYYY",
  );

  const benefUids = revenu.beneficiaire;
  const nbBeneficiaires = benefUids.length;
  const currentCategoryData = categoriesRevenus.find((c) => c.id === revenu.categorie);
  const categoryIcon = currentCategoryData ? currentCategoryData.icon : "💵";

  const displayAmountTotal = useMemo(() => {
    if (!initialRevenu) return "0,00";
    const amount = initialRevenu.montant;
    return amount.toFixed(2).replace(".", ",");
  }, [initialRevenu]);

  return (
    <ScrollView style={styles.detailContainer}>
      {isEditing ? (
        <EditRevenuForm
          editDescription={editDescription}
          setEditDescription={setEditDescription}
          editMontant={editMontant}
          setEditMontant={setEditMontant}
          editDateReception={editDateReception}
          showDateReceptionPicker={showDateReceptionPicker}
          isDateReceptionPickerVisible={isDateReceptionPickerVisible}
          handleConfirmDateReception={handleConfirmDateReception}
          hideDateReceptionPicker={hideDateReceptionPicker}
          isSubmitting={isSubmitting}
          handleUpdateRevenu={handleUpdateRevenu}
          setIsEditing={setIsEditing}
          editCategorie={editCategorie}
          setEditCategorie={setEditCategorie}
          isCategoryModalVisible={isCategoryModalVisible}
          setIsCategoryModalVisible={setIsCategoryModalVisible}
          categoriesRevenus={categoriesRevenus}
        />
      ) : (
        <>
          <View style={styles.detailHeaderContainer}>
            <Text style={styles.iconText}>{categoryIcon}</Text>
            <Text style={styles.detailTitle}>{revenu.description}</Text>
            <Text style={styles.detailDateText}>
              Revenu du {dateReceptionFormatted}
            </Text>
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
            title="Supprimer le revenu"
            message={`Voulez-vous vraiment supprimer "${revenu.description}" ? Cette action est irréversible.`}
            confirmText="Supprimer"
            isDestructive={true}
            onConfirm={async () => {
              setIsDeleteModalVisible(false);
              deleteRevenu(revenu.id);
            }}
            onCancel={() => setIsDeleteModalVisible(false)}
          />
        </>
      )}
    </ScrollView>
  );
};

export default RevenuDetailScreen;
