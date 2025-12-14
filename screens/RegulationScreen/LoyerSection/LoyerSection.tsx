import { View, Text, TextInput } from "react-native";
import { styles } from './LoyerSection.style'
import { LoyerSectionProps } from "./LoyerSection.type";



const LoyerSection: React.FC<LoyerSectionProps> = ({
    moisDeLoyerAffiche,
    loyerTotal,
    updateLoyerTotal,
    householdUsers,
    apportsAPLForm,
    updateApportsAPLForm,
    getDisplayName,
}) => {
    return (
<View style={styles.section}>
    <Text style={styles.sectionTitle}>💰 Loyer (Mois: {moisDeLoyerAffiche})</Text> 
    
    <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Loyer total pour le mois {moisDeLoyerAffiche} (€)</Text> 
        <TextInput
            style={styles.mainInput}
            keyboardType="numeric"
            value={loyerTotal}
            onChangeText={updateLoyerTotal}
        />
    </View>
    
    <View style={styles.inputRow}>
        {householdUsers.map(u => {
            const aplAmount = apportsAPLForm[u.id];
            
            const handleChangeApl = (text: string) => {
                updateApportsAPLForm(u.id, text)
            };

            return (
                <View key={u.id} style={styles.inputGroupHalf}>
                    <Text style={styles.inputLabel}>APL {getDisplayName(u.id)} (€)</Text>
                    <TextInput
                        style={styles.mainInput}
                        keyboardType="numeric"
                        value={aplAmount}
                        onChangeText={handleChangeApl}
                    />
                </View>
            );
        })}
    </View>
</View>
);
};

export default LoyerSection;