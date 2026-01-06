import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Button,
  Modal,
} from "react-native";
import { useComptes } from "../../hooks/useComptes";
import { useAuth } from "../../hooks/useAuth";
import { styles } from "./ChargesFixesScreen.style";
import { IChargeFixe, IUser } from "@/types";
import * as DB from "../../services/firebase/db";
import ChargeFixeItem from "./ChargeFixeItem/ChargeFixeItem";
import { useGetDisplayNameUserInHousehold } from "hooks/useGetDisplayNameUserInHousehold";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { Info } from "lucide-react-native";
import { useToast } from "hooks/useToast";

const ChargesFixesScreen: React.FC = () => {
  const {
    chargesFixes,
    isLoadingComptes,
    updateChargeFixe,
    deleteChargeFixe,
    currentMonthData,
    addChargeFixe,
    updateChargeFixePayeur,
  } = useComptes();

  const { user } = useAuth();
  const toast = useToast();
  if (!user) {
    return <NoAuthenticatedUser />;
  }

  const [nom, setNom] = useState("");
  const [montant, setMontant] = useState("");
  const [payeur, setPayeur] = useState<string | null>(user.id);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [householdUsers, setHouseholdUsers] = useState<IUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isPayeurModalVisible, setIsPayeurModalVisible] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      if (user.householdId) {
        try {
          const users = await DB.getHouseholdUsers(user.householdId);
          setHouseholdUsers(users);
        } catch (error) {
          console.error("Erreur chargement users:", error);
          toast.error("Erreur", "Impossible de charger les utilisateurs");
        } finally {
          setIsLoadingUsers(false);
        }
      } else {
        setIsLoadingUsers(false);
      }
    };
    loadUsers();
  }, [user.householdId]);

  const handleChargeUpdate = useCallback(
    async (id: string, newAmount: number) => {
      try {
        await updateChargeFixe(id, newAmount);
        toast.success("Succès", "Charge mise à jour");
      } catch (error) {
        toast.error("Erreur", "Échec de la mise à jour des charges");
        console.error("Erreur Charges:", error);
      }
    },
    [updateChargeFixe]
  );

  const handleChargeUpdatePayeur = useCallback(
    async (chargeId: string, newPayeurUid: string) => {
      try {
        await updateChargeFixePayeur(chargeId, newPayeurUid);
        toast.success("Succès", "Le payeur a été mis à jour");
      } catch (error) {
        toast.error("Erreur", "Échec de la mise à jour du payeur");
        console.error("Erreur update Payeur:", error);
      }
    },
    [updateChargeFixePayeur]
  );

  const handleAddDepense = useCallback(async () => {
    if (!currentMonthData) return;
    const montantMensuel = parseFloat(montant.replace(",", "."));

    if (!payeur) {
      toast.warning(
        "Erreur de saisie",
        "Veuillez sélectionner qui paie cette charge"
      );
      return;
    }

    if (!nom.trim()) {
      toast.warning(
        "Erreur de saisie",
        "Veuillez saisir une description pour la charge"
      );
      return;
    }

    if (isNaN(montantMensuel) || montantMensuel <= 0) {
      toast.warning(
        "Erreur de saisie",
        "Veuillez saisir un montant supérieur à 0 pour la charge."
      );
      return;
    }

    setIsSubmitting(true);

    const chargeFixeToAdd: Omit<IChargeFixe, "id" | "householdId"> = {
      nom: nom.trim(),
      montantMensuel,
      payeur: payeur,
      moisAnnee: currentMonthData.moisAnnee,
    };

    try {
      await addChargeFixe(chargeFixeToAdd);
      setNom("");
      setMontant("");
      setPayeur(user?.id || null);
      setShowForm(false);
      toast.success("Succès", "Charge fixe enregistrée");
    } catch (error) {
      console.error("Erreur charge fixe:", error);
      toast.error("Erreur", "Échec de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  }, [nom, montant, user, addChargeFixe, currentMonthData]);

  const selectPayeur = (uid: string) => {
    setPayeur(uid);
    setIsPayeurModalVisible(false);
  };

  if (isLoadingComptes) {
    return <Text style={styles.loading}>Chargement des charges...</Text>;
  }

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
          <TextInput
            style={styles.input}
            placeholder="Description (ex: Facture Internet)"
            placeholderTextColor="#95a5a6"
            value={nom}
            onChangeText={setNom}
            maxLength={30}
            editable={!isSubmitting}
          />
          <TextInput
            style={styles.input}
            placeholder="Montant mensuel (ex: 80.50)"
            placeholderTextColor="#95a5a6"
            value={montant}
            onChangeText={setMontant}
            keyboardType="decimal-pad"
            {...({ inputMode: "decimal" } as any)}
            maxLength={8}
            editable={!isSubmitting}
          />
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Payée par</Text>
            <TouchableOpacity
              style={[styles.input, styles.dropdownInput]}
              onPress={() => setIsPayeurModalVisible(true)}
              disabled={isSubmitting}
            >
              <Text style={!payeur ? styles.placeholderText : styles.inputText}>
                {useGetDisplayNameUserInHousehold(payeur, householdUsers)}
              </Text>
            </TouchableOpacity>
          </View>
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
        data={chargesFixes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChargeFixeItem
            charge={item}
            onUpdate={handleChargeUpdate}
            onDelete={deleteChargeFixe}
            householdUsers={householdUsers}
            onUpdatePayeur={handleChargeUpdatePayeur}
          />
        )}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 20 }}
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
