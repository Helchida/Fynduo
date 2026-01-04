import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "./NoAuthenticatedUser.style";
import { useNavigation } from "@react-navigation/native";
import { RootStackNavigationProp } from "@/types";

const NoAuthenticatedUser: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>🔒</Text>

        <Text style={styles.title}>Session expirée</Text>

        <Text style={styles.message}>
          Votre session n'est plus active ou vous n'êtes pas connecté. Veuillez
          vous identifier pour accéder à cette page.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NoAuthenticatedUser;
