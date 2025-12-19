import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { useComptes } from "../../hooks/useComptes";
import { useAuth } from "../../hooks/useAuth";
import { styles } from "./LoyerScreen.style";
import { IUser } from "../../types";
import * as DB from "../../services/firebase/db";
import { useGetDisplayNameUserInHousehold } from "hooks/useGetDisplayNameUserInHousehold";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";

type ApportsAPLState = { [uid: string]: string };

const LoyerScreen: React.FC = () => {
  const { currentMonthData, updateLoyer, isLoadingComptes } = useComptes();
  const { user } = useAuth();

  if (!user) {
    return <NoAuthenticatedUser />;
  }

  const [loyerTotal, setLoyerTotal] = useState("");
  const [apportsAPL, setApportsAPL] = useState<ApportsAPLState>({});
  const [loyerPayeurUid, setLoyerPayeurUid] = useState<string | null>(null);
  const [householdUsers, setHouseholdUsers] = useState<IUser[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isPayeurModalVisible, setIsPayeurModalVisible] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      if (user.householdId) {
        try {
          const users = await DB.getHouseholdUsers(user.householdId);
          setHouseholdUsers(users);
        } catch (error) {
          console.error("Erreur chargement users:", error);
          Alert.alert(
            "Erreur",
            "Impossible de charger les utilisateurs du foyer."
          );
        } finally {
          setIsLoadingUsers(false);
        }
      } else {
        setIsLoadingUsers(false);
      }
    };
    loadUsers();
  }, [user.householdId]);

  useEffect(() => {
    if (currentMonthData && householdUsers.length > 0) {
      setLoyerTotal(currentMonthData.loyerTotal.toFixed(2));
      setLoyerPayeurUid(currentMonthData.loyerPayeurUid || user.id || null);

      const initialApports: ApportsAPLState = {};
      householdUsers.forEach((u) => {
        const aplAmount = currentMonthData.apportsAPL?.[u.id] ?? 0;
        initialApports[u.id] = aplAmount.toFixed(2);
      });
      setApportsAPL(initialApports);
    } else if (!isLoadingUsers && householdUsers.length > 0 && user) {
      setLoyerPayeurUid(user.id);
    }
  }, [currentMonthData, householdUsers, user]);

  const selectPayeur = (uid: string) => {
    setLoyerPayeurUid(uid);
    setIsPayeurModalVisible(false);
  };

  const handleAplChange = (uid: string, text: string) => {
    setApportsAPL((prev) => ({
      ...prev,
      [uid]: text,
    }));
  };

  const handleSave = async () => {
    const total = parseFloat(loyerTotal.replace(",", "."));
    if (isNaN(total) || total < 0) {
      Alert.alert("Erreur", "Veuillez entrer un loyer total valide.");
      return;
    }
    if (!loyerPayeurUid) {
      Alert.alert("Erreur", "Veuillez sélectionner qui a payé le loyer.");
      return;
    }

    const finalApports: Record<string, number> = {};

    for (const uid in apportsAPL) {
      const aplValue = parseFloat(apportsAPL[uid].replace(",", "."));

      const userDisplay =
        householdUsers.find((u) => u.id === uid)?.displayName ||
        "un utilisateur";

      if (isNaN(aplValue) || aplValue < 0) {
        Alert.alert(
          "Erreur",
          `Le montant APL pour ${userDisplay} est invalide.`
        );
        return;
      }
      finalApports[uid] = parseFloat(aplValue.toFixed(2));
    }

    if (!currentMonthData) {
      Alert.alert(
        "Erreur",
        "Données du mois non chargées. Impossible d'enregistrer."
      );
      return;
    }

    setIsSaving(true);
    try {
      await updateLoyer(
        parseFloat(total.toFixed(2)),
        finalApports,
        loyerPayeurUid
      );
      Alert.alert(
        "Succès",
        "Le loyer et les APL individuels ont été mis à jour."
      );
    } catch (error) {
      console.error("Erreur Loyer:", error);
      Alert.alert(
        "Erreur",
        "Échec de l'enregistrement dans la base de données. Consultez la console."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingComptes) {
    return <Text style={styles.loading}>Chargement des données loyer...</Text>;
  }

  const totalApl = householdUsers.reduce((sum, u) => {
    const aplValue = parseFloat(apportsAPL[u.id]?.replace(",", ".") || "0");
    return sum + aplValue;
  }, 0);

  const loyerTotalFloat = parseFloat(loyerTotal.replace(",", ".") || "0");
  const loyerNet = loyerTotalFloat - totalApl;

  const isDisabled = isLoadingComptes || isLoadingUsers || isSaving;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.header}>Gestion du loyer</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Loyer total à payer (€)</Text>
        <TextInput
          style={styles.input}
          value={loyerTotal}
          onChangeText={setLoyerTotal}
          keyboardType="decimal-pad"
          {...({ inputMode: "decimal" } as any)}
          placeholder="e.g., 1200.00"
          editable={!isDisabled}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Qui payera le loyer ?</Text>
        <TouchableOpacity
          style={[
            styles.input,
            styles.dropdownInput,
            isDisabled && styles.disabledInput,
          ]}
          onPress={() => setIsPayeurModalVisible(true)}
          disabled={isDisabled}
        >
          <Text
            style={!loyerPayeurUid ? styles.placeholderText : styles.inputText}
          >
            {useGetDisplayNameUserInHousehold(loyerPayeurUid, householdUsers)}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          APL futures que recevront les colocataires
        </Text>
        {householdUsers.map((u) => (
          <View key={u.id} style={styles.inputGroup}>
            <Text style={styles.label}>
              APL futures que recevra {u.displayName} (€)
            </Text>
            <TextInput
              style={styles.input}
              value={apportsAPL[u.id] || ""}
              onChangeText={(text) => handleAplChange(u.id, text)}
              keyboardType="decimal-pad"
              {...({ inputMode: "decimal" } as any)}
              placeholder="e.g., 120.00"
              editable={!isDisabled}
            />
          </View>
        ))}
      </View>

      <View style={styles.resultContainer}>
        <Text style={styles.resultLabel}>Total APL :</Text>
        <Text style={styles.resultValue}>{totalApl.toFixed(2)} €</Text>
      </View>

      <View style={styles.resultContainer}>
        <Text style={styles.resultLabel}>
          Loyer Net (Total - APL) à virer à l'agence
        </Text>
        <Text style={styles.resultValue}>{loyerNet.toFixed(2)} €</Text>
      </View>

      <View style={styles.validationContainer}>
        <TouchableOpacity
          style={[styles.validationButton, isDisabled && styles.disabledButton]}
          onPress={handleSave}
          disabled={isDisabled}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.validationButtonText}>{"Enregistrer"}</Text>
          )}
        </TouchableOpacity>
      </View>

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
              renderItem={({ item }: { item: IUser }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    item.id === loyerPayeurUid && styles.modalItemSelected,
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
    </ScrollView>
  );
};

export default LoyerScreen;
