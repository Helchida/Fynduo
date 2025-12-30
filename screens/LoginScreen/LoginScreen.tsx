import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { styles } from "./LoginScreen.style";
import { RootStackNavigationProp } from "@/types";
import { useNavigation } from "@react-navigation/native";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "services/firebase/config";
import Constants from "expo-constants";

const LoginScreen: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigation = useNavigation<RootStackNavigationProp>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isDev = Constants.appOwnership === "expo";
  const resendVerification = async () => {
    if (!auth.currentUser) return;

    const actionCodeSettings = {
      url: "https://fynduo.vercel.app/",
      handleCodeInApp: false,
    };

    await sendEmailVerification(auth.currentUser, actionCodeSettings);
    Alert.alert("Email envoyé", "Vérifiez votre boîte mail.");
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir email et mot de passe.");
      return;
    }

    try {
      await login!(email, password);
    } catch (error: any) {
      Alert.alert(
        "Erreur login",
        error.message || "Impossible de se connecter."
      );
    }
  };

  return (
    <View style={[styles.container, styles.innerContainer]}>
      <View style={styles.headerContainer}>
        <Image
          source={require("../../public/logo-with-text.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Connexion..." : "Se connecter"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          style={{ marginTop: 20, alignItems: "center" }}
        >
          <Text style={{ color: "#2c3e50", fontSize: 14 }}>
            Pas encore de compte ?{" "}
            <Text style={{ color: "#3498db", fontWeight: "bold" }}>
              Créer un compte
            </Text>
          </Text>
        </TouchableOpacity>
        {!isDev && (
          <TouchableOpacity onPress={resendVerification}>
            <Text style={{ color: "#3498db", marginTop: 10 }}>
              Renvoyer l’email de vérification
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default LoginScreen;
