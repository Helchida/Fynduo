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
import { BanknoteArrowDown, Calculator, Home, House, TriangleAlert } from "lucide-react-native";
import { InfoModal } from "components/ui/InfoModal/InfoModal";
import { useScreenInfo } from "hooks/useScreenInfo";

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
  const { showInfoModal, setShowInfoModal } = useScreenInfo();

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
            "Impossible de charger les utilisateurs du foyer.",
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
              householdUsers.map((u) => u.id),
            );
            config = await DB.getLoyerConfig(user.activeHouseholdId);
          }

          setLoyerConfig(config);
        } catch (error) {
          console.error("Erreur chargement config loyer:", error);
          toast.error(
            "Erreur",
            "Impossible de charger la configuration du loyer.",
          );
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
        "Veuillez entrer un loyer total supérieur à 0.",
      );
      return;
    }
    if (!loyerPayeurUid) {
      toast.warning(
        "Erreur de saisie",
        "Veuillez sélectionner qui a payé le loyer.",
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
          `Le montant APL pour ${userDisplay} est invalide.`,
        );
        return;
      }
      finalApports[uid] = parseFloat(aplValue.toFixed(2));
    }

    if (!user.activeHouseholdId) {
      toast.error("Erreur", "Foyer non identifié. Impossible d'enregistrer.");
      return;
    }

    setIsSaving(true);
    try {
      await DB.updateLoyerConfig(
        user.activeHouseholdId,
        parseFloat(total.toFixed(2)),
        finalApports,
        loyerPayeurUid,
      );
      toast.success(
        "Succès",
        "Configuration du loyer mise à jour avec succès.",
      );

      const updatedConfig = await DB.getLoyerConfig(user.activeHouseholdId);
      setLoyerConfig(updatedConfig);
    } catch (error) {
      console.error("Erreur Config Loyer:", error);
      toast.error("Erreur", "Échec de l'enregistrement de la configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingConfig || isLoadingUsers) {
    return (
      <Text style={common.loadingText}>Chargement des données loyer...</Text>
    );
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

      <View
        style={{
          backgroundColor: "#e3f2fd",
          padding: 15,
          marginBottom: 15,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#2196f3",
        }}
      >
        <Text style={{ color: "#1565c0", fontSize: 14, fontWeight: "600" }}>
          Configuration active
        </Text>
        <Text style={{ color: "#1565c0", fontSize: 12, marginTop: 5 }}>
          Ces données seront utilisées lors de la prochaine clôture mensuelle.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={common.row}>
          <House size={20} color={"#7a10c0"} style={{ marginBottom: 14 }} />
          <Text style={styles.sectionTitle}> Loyer & Paiement</Text>
        </View>
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
        <View style={common.row}>
          <BanknoteArrowDown
            size={20}
            color={"#125fd3"}
            style={{ marginBottom: 14 }}
          />
          <Text style={styles.sectionTitle}> Apports APL</Text>
        </View>
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
      <InfoModal
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      >
        <View style={common.centerRow}>
          <Home size={30} color={"#E67E22"} style={common.infoModalIconTitle} />
          <Text style={common.infoModalTitle}>À propos du loyer</Text>
        </View>

        <Text style={common.infoModalText}>
          Cet écran vous permet de configurer le{" "}
          <Text style={common.bold}>loyer</Text> et les{" "}
          <Text style={common.bold}>APL</Text> de chaque membre du foyer, ainsi
          que de désigner le membre qui effectuera le virement à l'agence.
        </Text>

        <Text style={common.infoModalText}>
          Le montant à verser à l'agence correspond à la somme des parts de
          loyer de chaque membre,{" "}
          <Text style={common.bold}>déduites de leurs APL respectifs</Text>. En
          effet, les APL sont considérés comme directement versés à l'agence.
        </Text>

        <View style={[common.infoModalBox, common.trickBox]}>
          <View style={common.row}>
            <Calculator
              size={14}
              color={"#004085"}
              style={common.boxIconTitle}
            />
            <Text style={[common.boxTitle, common.trickTitle]}> Calcul</Text>
          </View>
          <Text style={[common.boxText, common.trickText]}>
            Part à verser par membre ={" "}
            <Text style={common.bold}>Loyer individuel − APL</Text>. Le total dû
            à l'agence est la somme de ces parts pour tous les membres.
          </Text>
        </View>

        <View style={[common.infoModalBox, common.warningBox]}>
          <View style={common.row}>
            <TriangleAlert
              size={14}
              color={"#d82007"}
              style={common.boxIconTitle}
            />
            <Text style={[common.boxTitle, common.warningTitle]}>
              {" "}
              Important
            </Text>
          </View>
          <Text style={[common.boxText, common.warningText]}>
            Cette configuration est utilisée lors de la{" "}
            <Text style={common.bold}>régularisation mensuelle</Text>. Elle peut
            être ajustée directement depuis l'écran de régularisation si
            nécessaire.
          </Text>
        </View>
      </InfoModal>
    </ScrollView>
  );
};

export default LoyerScreen;
