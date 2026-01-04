import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { styles } from "./RegisterScreen.style";
import { createUserProfile } from "services/firebase/db";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "services/firebase/config";
import Constants from "expo-constants";

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const isDev = Constants.appOwnership === "expo";

      await createUserProfile(user.uid, {
        email: user.email || email,
        displayName: email.split("@")[0],
        householdId: user.uid,
      });

      if (!isDev) {
        await sendEmailVerification(user);
      }

      Alert.alert(
        "Compte créé",
        "Un email de vérification vous a été envoyé. Vérifiez votre boîte mail avant de vous connecter."
      );
      navigation.navigate("EmailVerification");
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.innerContainer}>
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
            <TextInput
              style={styles.input}
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>S'inscrire</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              style={{ marginTop: 20, alignItems: "center" }}
            >
              <Text style={{ color: "#2c3e50", fontSize: 14 }}>
                Déjà un compte ?{" "}
                <Text style={{ color: "#3498db", fontWeight: "bold" }}>
                  Se connecter
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default RegisterScreen;
