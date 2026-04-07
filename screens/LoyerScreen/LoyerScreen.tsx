import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { styles } from "../../styles/screens/LoyerScreen/LoyerScreen.style";
import { common } from "../../styles/common.style";
import { IUser, ILoyerConfig } from "../../types";
import * as DB from "../../services/supabase/db";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { useToast } from "hooks/useToast";
import { getDisplayNameUserInHousehold } from "utils/getDisplayNameUserInHousehold";

type ApportsAPLState = { [uid: string]: string };

const LoyerScreen: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  if (!user) {
    return <NoAuthenticatedUser />;
  }

  const [loyerTotal, setLoyerTotal] = useState("");
  const [apportsAPL, setApportsAPL] = useState<ApportsAPLState>({});
  const [loyerPayeurUid, setLoyerPayeurUid] = useState<string | null>(null);
  const [householdUsers, setHouseholdUsers] = useState<IUser[]>([]);
  const [loyerConfig, setLoyerConfig] = useState<ILoyerConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isPayeurModalVisible, setIsPayeurModalVisible] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      if (user.activeHouseholdId) {
        try {
          const users = await DB.getHouseholdUsers(user.activeHouseholdId);
          setHouseholdUsers(users);
        } catch (error) {
          console.error("Erreur chargement users:", error);
          toast.error(
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
  }, [user.activeHouseholdId]);

  useEffect(() => {
    const loadLoyerConfig = async () => {
      if (user.activeHouseholdId && householdUsers.length > 0) {
        try {
          let config = await DB.getLoyerConfig(user.activeHouseholdId);

          if (!config) {
            await DB.initLoyerConfig(
              user.activeHouseholdId,
              householdUsers.map((u) => u.id)
            );
            config = await DB.getLoyerConfig(user.activeHouseholdId);
          }

          setLoyerConfig(config);
        } catch (error) {
          console.error("Erreur chargement config loyer:", error);
          toast.error("Erreur", "Impossible de charger la configuration du loyer.");
        } finally {
          setIsLoadingConfig(false);
        }
      }
    };

    if (!isLoadingUsers && householdUsers.length > 0) {
      loadLoyerConfig();
    }
  }, [user.activeHouseholdId, householdUsers, isLoadingUsers]);

  useEffect(() => {
    if (loyerConfig && householdUsers.length > 0) {
      setLoyerTotal(loyerConfig.loyerTotal.toFixed(2));
      setLoyerPayeurUid(loyerConfig.loyerPayeurUid || user.id || null);

      const initialApports: ApportsAPLState = {};
      householdUsers.forEach((u) => {
        const aplAmount = loyerConfig.apportsAPL?.[u.id] ?? 0;
        initialApports[u.id] = aplAmount.toFixed(2);
      });
      setApportsAPL(initialApports);
    }
  }, [loyerConfig, householdUsers, user]);

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
    if (isNaN(total) || total <= 0) {
      toast.warning(
        "Erreur de saisie",
        "Veuillez entrer un loyer total supérieur à 0."
      );
      return;
    }
    if (!loyerPayeurUid) {
      toast.warning(
        "Erreur de saisie",
        "Veuillez sélectionner qui a payé le loyer."
      );
      return;
    }

    const finalApports: Record<string, number> = {};

    for (const uid in apportsAPL) {
      const aplValue = parseFloat(apportsAPL[uid].replace(",", "."));

      const userDisplay =
        householdUsers.find((u) => u.id === uid)?.displayName ||
        "un utilisateur";

      if (isNaN(aplValue) || aplValue < 0) {
        toast.warning(
          "Erreur de saisie",
          `Le montant APL pour ${userDisplay} est invalide.`
        );
        return;
      }
      finalApports[uid] = parseFloat(aplValue.toFixed(2));
    }

    if (!user.activeHouseholdId) {
      toast.error(
        "Erreur",
        "Foyer non identifié. Impossible d'enregistrer."
      );
      return;
    }

    setIsSaving(true);
    try {
      await DB.updateLoyerConfig(
        user.activeHouseholdId,
        parseFloat(total.toFixed(2)),
        finalApports,
        loyerPayeurUid
      );
      toast.success("Succès", "Configuration du loyer mise à jour avec succès.");
      
      const updatedConfig = await DB.getLoyerConfig(user.activeHouseholdId);
      setLoyerConfig(updatedConfig);
    } catch (error) {
      console.error("Erreur Config Loyer:", error);
      toast.error(
        "Erreur",
        "Échec de l'enregistrement de la configuration."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingConfig || isLoadingUsers) {
    return <Text style={common.loadingText}>Chargement des données loyer...</Text>;
  }

  const totalApl = householdUsers.reduce((sum, u) => {
    const aplValue = parseFloat(apportsAPL[u.id]?.replace(",", ".") || "0");
    return sum + aplValue;
  }, 0);

  const loyerTotalFloat = parseFloat(loyerTotal.replace(",", ".") || "0");
  const loyerNet = loyerTotalFloat - totalApl;

  const isDisabled = isLoadingConfig || isLoadingUsers || isSaving;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={common.scrollContent}
    >
      <Text style={common.sectionTitle}>Gestion du loyer</Text>

      <View style={{ backgroundColor: '#e3f2fd', padding: 15, marginBottom: 15, borderRadius: 8, borderWidth: 1, borderColor: '#2196f3' }}>
        <Text style={{ color: '#1565c0', fontSize: 14, fontWeight: '600' }}>
          ℹ️ Configuration active
        </Text>
        <Text style={{ color: '#1565c0', fontSize: 12, marginTop: 5 }}>
          Ces données seront utilisées lors de la prochaine clôture mensuelle.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>💰 Loyer & Paiement</Text>
        <View style={common.inputGroup}>
          <Text style={common.label}>Loyer total à payer (€)</Text>
          <TextInput
            style={common.input}
            value={loyerTotal}
            onChangeText={setLoyerTotal}
            keyboardType="decimal-pad"
            {...({ inputMode: "decimal" } as any)}
            placeholder="e.g., 1200.00"
            editable={!isDisabled}
          />
        </View>

        <View style={common.inputGroup}>
          <Text style={common.label}>Qui payera le loyer ?</Text>
          <TouchableOpacity
            style={[
              common.input,
              styles.dropdownInput,
              isDisabled && styles.disabledInput,
            ]}
            onPress={() => setIsPayeurModalVisible(true)}
            disabled={isDisabled}
          >
            <Text
              style={
                !loyerPayeurUid ? styles.placeholderText : styles.inputText
              }
            >
              {getDisplayNameUserInHousehold(loyerPayeurUid, householdUsers)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.card, styles.aplCard]}>
        <Text style={styles.sectionTitle}>📩 Apports APL</Text>
        {householdUsers.map((u) => (
          <View key={u.id} style={common.inputGroup}>
            <Text style={common.label}>APL de {u.displayName}</Text>
            <TextInput
              style={common.input}
              value={apportsAPL[u.id] || ""}
              onChangeText={(text) =>
                handleAplChange(u.id, text.replace(",", "."))
              }
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#95a5a6"
              maxLength={8}
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
        <Text style={styles.resultLabel}>Loyer à virer à l'agence :</Text>
        <Text style={styles.resultValue}>{loyerNet.toFixed(2)} €</Text>
      </View>

      <View style={styles.validationContainer}>
        <TouchableOpacity
          style={[styles.validationButton, isDisabled && common.disabledButton]}
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
        <View style={common.modalOverlay}>
          <View style={common.modalContent}>
            <Text style={common.modalTitle}>Sélectionner le payeur</Text>
            <FlatList
              data={householdUsers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }: { item: IUser }) => (
                <TouchableOpacity
                  style={[
                    common.modalItem,
                    item.id === loyerPayeurUid && common.modalItemSelected,
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
    </ScrollView>
  );
};

export default LoyerScreen;
