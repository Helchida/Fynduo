import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { styles } from './LoginScreen.style';

const LoginScreen: React.FC = () => {
    const { login, isLoading } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Erreur", "Veuillez remplir email et mot de passe.");
            return;
        }

        try {
            await login!(email, password);
        } catch (error: any) {
            Alert.alert("Erreur login", error.message || "Impossible de se connecter.");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Bienvenue sur FYNDUO</Text>
                <Text style={styles.subHeader}>L'appli pour gérer les comptes de la coloc</Text>
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
            </View>
        </View>
    );
};

export default LoginScreen;
