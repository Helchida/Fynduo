import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { styles } from "./UserSettingsScreen.style";
import {
  Mail,
  Lock,
  Trash2,
  ChevronRight,
  X,
  Check,
} from "lucide-react-native";
import {
  updateProfile,
  updateEmail,
  updatePassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { auth } from "services/firebase/config";
import { updateUserInfo } from "services/firebase/db";
import { useToast } from "hooks/useToast";
import { useNavigation } from "@react-navigation/native";
import { RootStackNavigationProp } from "@/types";

const UserSettingsScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const toast = useToast();
  const { user, logout, updateLocalUser } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  const [activeAction, setActiveAction] = useState<
    "EMAIL" | "PASSWORD" | "DELETE" | null
  >(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!user) return null;

  const reauthenticate = async () => {
    if (!currentPassword) {
      toast.error("Erreur", "Mot de passe actuel requis");
      return false;
    }
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser?.email!,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser!, credential);
      return true;
    } catch (error) {
      toast.error("Erreur", "Mot de passe actuel incorrect");
      return false;
    }
  };

  const handleUpdateName = async () => {
    if (!auth.currentUser || displayName.trim() === "" || !user) return;

    setIsUpdatingName(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim(),
      });
      await updateUserInfo(user.id, { displayName: displayName.trim() });
      updateLocalUser(displayName.trim());

      toast.success("Succès", "Nom mis à jour !");
    } catch (err: any) {
      toast.error("Erreur", "Vérifiez les permissions Firestore");
      console.error("Erreur Firestore Details:", err);
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleConfirmAction = async () => {
    setIsProcessing(true);
    const success = await reauthenticate();

    if (success) {
      try {
        if (activeAction === "EMAIL") {
          await updateEmail(auth.currentUser!, newValue);
          await updateUserInfo(user.id, { email: newValue });
          toast.success("Succès", "Email modifié");
        } else if (activeAction === "PASSWORD") {
          await updatePassword(auth.currentUser!, newValue);
          toast.success("Succès", "Mot de passe modifié");
        } else if (activeAction === "DELETE") {
          const uid = auth.currentUser!.uid;
          const { deleteUserInfo } = require("services/firebase/db");
          await deleteUserInfo(uid);
          await deleteUser(auth.currentUser!);
          toast.success(
            "Au revoir",
            "Votre compte et vos données ont été supprimés."
          );
          logout?.();
          return;
        }
        setActiveAction(null);
        setCurrentPassword("");
        setNewValue("");
      } catch (err: any) {
        toast.error("Erreur", "L'action a échoué");
      }
    }
    setIsProcessing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.header}>Paramètres</Text>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Nom d'affichage</Text>
        <TextInput
          style={styles.input}
          placeholder="Nom d'affichage"
          value={displayName}
          onChangeText={setDisplayName}
          placeholderTextColor="#bdc3c7"
        />
        <TouchableOpacity
          style={[styles.saveButton, { opacity: isUpdatingName ? 0.7 : 1 }]}
          onPress={handleUpdateName}
          disabled={isUpdatingName}
        >
          {isUpdatingName ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Enregistrer le nom</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { marginBottom: 10, marginTop: 10 }]}>
        Sécurité
      </Text>

      {activeAction && (
        <View
          style={[
            styles.card,
            {
              borderColor: activeAction === "DELETE" ? "#e74c3c" : "#27a1d1",
              borderWidth: 1,
            },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 15,
            }}
          >
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
              {activeAction === "EMAIL" && "Nouveau mail"}
              {activeAction === "PASSWORD" && "Nouveau mot de passe"}
              {activeAction === "DELETE" && "Supprimer le compte"}
            </Text>
            <TouchableOpacity onPress={() => setActiveAction(null)}>
              <X color="#bdc3c7" size={20} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Mot de passe actuel"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />

          {(activeAction === "EMAIL" || activeAction === "PASSWORD") && (
            <TextInput
              style={styles.input}
              placeholder={
                activeAction === "EMAIL"
                  ? "Nouvel Email"
                  : "Nouveau mot de passe (6 car. min)"
              }
              secureTextEntry={activeAction === "PASSWORD"}
              value={newValue}
              onChangeText={setNewValue}
            />
          )}

          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor:
                  activeAction === "DELETE" ? "#e74c3c" : "#2c3e50",
              },
            ]}
            onPress={handleConfirmAction}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Confirmer</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[styles.actionButton, { borderLeftColor: "#27a1d1ff" }]}
        onPress={() => setActiveAction("EMAIL")}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Mail color="#27a1d1ff" size={20} style={{ marginRight: 15 }} />
          <Text style={styles.actionText}>Modifier l'email</Text>
        </View>
        <ChevronRight color="#bdc3c7" size={20} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { borderLeftColor: "#f39c12" }]}
        onPress={() => setActiveAction("PASSWORD")}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Lock color="#f39c12" size={20} style={{ marginRight: 15 }} />
          <Text style={styles.actionText}>Changer le mot de passe</Text>
        </View>
        <ChevronRight color="#bdc3c7" size={20} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { borderLeftColor: "#e74c3c" }]}
        onPress={() => setActiveAction("DELETE")}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Trash2 color="#e74c3c" size={20} style={{ marginRight: 15 }} />
          <Text style={[styles.actionText, { color: "#2c3e50" }]}>
            Supprimer mon compte
          </Text>
        </View>
        <ChevronRight color="#bdc3c7" size={20}/>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default UserSettingsScreen;
