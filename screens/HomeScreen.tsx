import React from 'react';
import { 
    View, 
    Text,
    ScrollView, 
    TouchableOpacity, 
    Alert,
} from 'react-native';
import { useComptes } from '../hooks/useComptes';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../types'; 
import { useAuth } from '../hooks/useAuth';
import { styles } from '../styles/screens/HomeScreen.style';


const MOCK_HISTORY = [
    { month: 'Sept', total: 1250.00 },
    { month: 'Oct', total: 1180.50 },
    { month: 'Nov', total: 1320.80 },
];

const HistogramPlaceholder = ({ month, total }: { month: string, total: number }) => {
    const MAX_TOTAL = 1500;
    const MAX_BAR_HEIGHT = 120;
    const barHeight = (total / MAX_TOTAL) * MAX_BAR_HEIGHT; 

    return (
        <View style={styles.historyColumn}>
            <Text style={styles.historyTotalLabel}>{total.toFixed(0)}€</Text>
            <View style={[styles.bar, { height: barHeight }]} />
            <Text style={styles.historyMonthLabel}>{month}</Text>
        </View>
    );
};

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<RootStackNavigationProp>();
    const { user, logout, isLoading } = useAuth();
    console.log(user)
    const { isLoadingComptes } = useComptes();
    
    if (isLoadingComptes || isLoading) {
        return <Text style={styles.loading}>Chargement...</Text>;
    }

    return (
        <View style={styles.mainView}>
            <View style={styles.headerContainer}>
                <Text style={styles.welcomeText}>Bienvenue, {user?.displayName} !</Text>
                <TouchableOpacity 
                    style={styles.logoutButtonTop} 
                    onPress={logout}
                >
                    <Text style={styles.logoutTextTop}>Se déconnecter</Text> 
                </TouchableOpacity>
            </View>
            
            <ScrollView 
                style={styles.container}
                showsVerticalScrollIndicator={false}
            >
                
                <View style={styles.historyCard}>
                    <Text style={styles.sectionTitle}>Total des dépenses</Text>
                    
                    <View style={styles.historyNavigator}>
                        <TouchableOpacity 
                            style={styles.navArrow} 
                            onPress={() => Alert.alert("Navigation", "Afficher les 3 mois précédents")}
                        >
                            <Text style={styles.navArrowText}>{'<'}</Text>
                        </TouchableOpacity>
                
                        <View style={styles.chartArea}>
                            {MOCK_HISTORY.map((data, index) => (
                                <HistogramPlaceholder key={index} {...data} />
                            ))}
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.navArrow} 
                            onPress={() => Alert.alert("Navigation", "Afficher les 3 mois suivants")}
                        >
                            <Text style={styles.navArrowText}>{'>'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                
                <View style={styles.actionsContainer}>
                    <TouchableOpacity 
                        style={[styles.actionButton, { borderLeftColor: '#f39c12' }]}
                        onPress={() => navigation.navigate('Regulation')}
                    >
                        <Text style={styles.actionText}>Faire les comptes</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.actionButton, { borderLeftColor: '#2ecc71' }]}
                        onPress={() => navigation.navigate('ChargesVariables')}
                    >
                        <Text style={styles.actionText}>Charges variables</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.actionButton, { borderLeftColor: '#d14127ff' }]}
                        onPress={() => navigation.navigate('ChargesFixes')}
                    >
                        <Text style={styles.actionText}>Charges fixes</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.actionButton, { borderLeftColor: '#27a1d1ff' }]}
                        onPress={() => navigation.navigate('Loyer')}
                    >
                        <Text style={styles.actionText}>Loyer et APL</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.actionButton, { borderLeftColor: '#9b59b6' }]}
                        onPress={() => Alert.alert("Statistiques", "Fonctionnalité de stats à venir.")}
                    >
                        <Text style={styles.actionText}>Statistiques</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.actionButton, { borderLeftColor: '#34495e' }]}
                        onPress={() => navigation.navigate('History')}
                    >
                        <Text style={styles.actionText}>Historique</Text>
                    </TouchableOpacity>

                </View>
                
            </ScrollView>
        </View>
    );
};

export default HomeScreen;