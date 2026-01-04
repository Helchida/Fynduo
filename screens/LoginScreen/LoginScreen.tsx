import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { styles } from "./LoginScreen.style";
import { RootStackNavigationProp } from "@/types";
import { useNavigation } from "@react-navigation/native";
import {
  loginRateLimiter,
  MAX_ATTEMPTS,
} from "../../services/login/loginRateLimiter";

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const navigation = useNavigation<RootStackNavigationProp>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  const handleLogin = async () => {
    setErrorMessage(null);
    if (!email || !password) {
      setErrorMessage("Veuillez remplir email et mot de passe.");
      return;
    }

    const rateLimitCheck = loginRateLimiter.canAttemptLogin(email);

    if (!rateLimitCheck.allowed) {
      setErrorMessage(rateLimitCheck.message || "Trop de tentatives.");
      return;
    }

    setLocalLoading(true);
    try {
      await login!(email, password);
      loginRateLimiter.resetAttempts(email);
      setRemainingAttempts(null);
    } catch (error: any) {
      loginRateLimiter.recordFailedAttempt(email);
      const remaining = loginRateLimiter.getRemainingAttempts(email);
      setRemainingAttempts(remaining);
      let msg = "Impossible de se connecter.";

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        msg = "Email ou mot de passe incorrect.";
      } else if (error.code === "auth/user-not-found") {
        msg = "Aucun compte associé à cet email.";
      } else if (error.code === "auth/too-many-requests") {
        msg =
          "Trop de tentatives. Compte temporairement désactivé par Firebase.";
      } else {
        msg = error.message;
      }

      setErrorMessage(msg);
    } finally {
      setLocalLoading(false);
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
        {errorMessage && (
          <View
            style={{
              backgroundColor: "#f8d7da",
              padding: 12,
              borderRadius: 8,
              marginBottom: 15,
              borderLeftWidth: 4,
              borderLeftColor: "#dc3545",
            }}
          >
            <Text style={{ color: "#721c24", fontSize: 14, fontWeight: "500" }}>
              ❌ {errorMessage}
            </Text>
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrorMessage(null);
            setRemainingAttempts(null);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrorMessage(null);
          }}
          secureTextEntry
        />

        {remainingAttempts !== null &&
          remainingAttempts > 0 &&
          remainingAttempts < MAX_ATTEMPTS &&
          !errorMessage?.includes("bloqué") && (
            <View
              style={{
                backgroundColor: "#fff3cd",
                padding: 12,
                borderRadius: 8,
                borderLeftWidth: 4,
                borderLeftColor: "#ffc107",
              }}
            >
              <Text style={{ color: "#856404", fontSize: 14 }}>
                ⚠️ Tentatives restantes : {remainingAttempts}/{MAX_ATTEMPTS}
              </Text>
            </View>
          )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={localLoading}
        >
          {localLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Se connecter</Text>
          )}
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
      </View>
    </View>
  );
};

export default LoginScreen;
