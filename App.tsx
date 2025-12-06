import 'react-native-gesture-handler';
import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthProvider } from './context/AuthContext';
import { ComptesProvider } from './context/ComptesContext';
import RootNavigator from './navigation/RootNavigator';
import { useAuth } from './hooks/useAuth';

const AppContent: React.FC = () => {
    const { isLoading } = useAuth();
    
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2980b9" />
            </View>
        );
    }

    return <RootNavigator />;
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <ComptesProvider>
                <AppContent />
            </ComptesProvider>
        </AuthProvider>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default App;