import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useComptes } from '../hooks/useComptes';
import { RootStackNavigationProp } from '../types';
import { styles } from '../styles/screens/HistoryScreen.style';


const HistoryScreen: React.FC = () => {
    const navigation = useNavigation<RootStackNavigationProp>();
    const { historyMonths, loadHistory, isLoadingComptes } = useComptes();
    
    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    if (isLoadingComptes) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#2c3e50" /></View>;
    }

    if (historyMonths.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucun compte clôturé n'est disponible pour l'instant.</Text>
            </View>
        );
    }

    const sortedHistory = [...historyMonths].sort((a, b) => b.moisAnnee.localeCompare(a.moisAnnee));

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Comptes clôturés</Text>
            {sortedHistory.map((monthData) => (
                <TouchableOpacity
                    key={monthData.id}
                    style={styles.monthCard}
                    onPress={() => navigation.navigate('HistoryDetail', { moisAnnee: monthData.moisAnnee })}
                >
                    <Text style={styles.monthTitle}>{monthData.moisAnnee}</Text>
                    <Text style={styles.statusBadge}>Clôturé</Text>
                    <Text style={styles.detailText}>Voir le détail</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

export default HistoryScreen;