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
import { styles } from "../../styles/screens/LoginScreen/LoginScreen.style";
import { common } from "../../styles/common.style";
import { RootStackNavigationProp } from "@/types";
import { useNavigation } from "@react-navigation/native";
import {
  loginRateLimiter,
  MAX_ATTEMPTS,
} from "../../services/login/loginRateLimiter";

const LoginScreen: React.FC = () => {
  const { login, sendPasswordReset } = useAuth();
  const navigation = useNavigation<RootStackNavigationProp>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMessage(
        "Veuillez entrer votre email pour réinitialiser le mot de passe."
      );
      return;
    }

    setLocalLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await sendPasswordReset!(email);
      setSuccessMessage(
        "Email de réinitialisation envoyé ! Vérifiez votre boîte de réception."
      );
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        setErrorMessage("Aucun utilisateur trouvé avec cet email.");
      } else {
        setErrorMessage(
          "Erreur lors de l'envoi de l'email. Réessayez plus tard."
        );
      }
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <View style={[styles.container, common.authInnerContainer]}>
      <View style={common.authHeaderContainer}>
        <Image
          source={require("../../public/logo-with-text.png")}
          style={common.authLogo}
          resizeMode="contain"
        />
      </View>

      <View style={common.formContainer}>
        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>❌ {errorMessage}</Text>
          </View>
        )}

        <TextInput
          style={common.input}
          placeholder="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrorMessage(null);
            setSuccessMessage(null);
            setRemainingAttempts(null);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={common.input}
          placeholder="Mot de passe"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrorMessage(null);
          }}
          secureTextEntry
        />

        {successMessage && (
          <View style={styles.successFeedbackContainer}>
            <Text style={styles.successFeedbackText}>{successMessage}</Text>
          </View>
        )}

        {remainingAttempts !== null &&
          remainingAttempts > 0 &&
          remainingAttempts < MAX_ATTEMPTS &&
          !errorMessage?.includes("bloqué") && (
            <View style={styles.warningFeedbackContainer}>
              <Text style={styles.warningFeedbackText}>
                ⚠️ Tentatives restantes : {remainingAttempts}/{MAX_ATTEMPTS}
              </Text>
            </View>
          )}

        <TouchableOpacity
          style={common.authButton}
          onPress={handleLogin}
          disabled={localLoading}
        >
          {localLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={common.authButtonText}>Se connecter</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleForgotPassword}
          style={styles.forgotPasswordButton}
          disabled={localLoading}
        >
          <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          style={styles.registerContainer}
        >
          <Text style={styles.registerText}>
            Pas encore de compte ?{" "}
            <Text style={styles.registerLink}>Créer un compte</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
