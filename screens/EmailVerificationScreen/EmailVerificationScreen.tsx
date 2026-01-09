import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { styles } from "./EmailVerificationScreen.style";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "services/firebase/config";
import { useNavigation } from "@react-navigation/native";
import { useToast } from "hooks/useToast";

const EmailVerificationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const toast = useToast();
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const isDevMode = __DEV__;

  useEffect(() => {
    if (isDevMode) {
      navigation.replace("Home");
      return;
    }

    const interval = setInterval(async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload();

        if (auth.currentUser.emailVerified) {
          clearInterval(interval);
          setTimeout(() => {}, 1500);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [navigation, isDevMode]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const resendVerification = async () => {
    if (!auth.currentUser || !canResend) return;

    try {
      await sendEmailVerification(auth.currentUser);
      toast.success("Succès", "Email de vérification renvoyé.");
      setCanResend(false);
      setCountdown(60);
    } catch (error: any) {
      toast.error("Erreur", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.replace("Login");
    } catch (error: any) {
      toast.error("Erreur", error.message);
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
            {auth.currentUser?.emailVerified ? (
              <View style={styles.successContainer}>
                <View style={styles.successIconContainer}>
                  <Text style={styles.successIcon}>✓</Text>
                </View>
                <Text style={styles.successTitle}>Email vérifié !</Text>
                <Text style={styles.successSubtitle}>
                  Redirection en cours...
                </Text>
              </View>
            ) : (
              <View style={styles.waitingContainer}>
                <ActivityIndicator size="large" color="#3498db" />
                <Text style={styles.waitingTitle}>Vérifiez votre email</Text>
                <Text style={styles.waitingDescription}>
                  Un email de vérification a été envoyé à{" "}
                  <Text style={styles.emailText}>
                    {auth.currentUser?.email}
                  </Text>
                  {"\n\n"}
                  Cliquez sur le lien dans l'email, puis revenez ici.
                  {"\n"}
                  La vérification se fera automatiquement.
                </Text>

                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    onPress={resendVerification}
                    disabled={!canResend}
                    style={[
                      styles.resendButton,
                      canResend
                        ? styles.resendButtonEnabled
                        : styles.resendButtonDisabled,
                    ]}
                  >
                    <Text style={styles.resendButtonText}>
                      {canResend
                        ? "Renvoyer l'email"
                        : `Renvoyer dans ${countdown}s`}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleLogout}
                    style={styles.logoutButton}
                  >
                    <Text style={styles.logoutButtonText}>
                      Annuler et se déconnecter
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default EmailVerificationScreen;
