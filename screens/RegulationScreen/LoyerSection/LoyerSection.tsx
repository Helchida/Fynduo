import { View, Text, TextInput } from "react-native";
import { styles } from "../../../styles/screens/RegulationScreen/LoyerSection/LoyerSection.style";
import { common } from "styles/common.style";
import { LoyerSectionProps } from "./LoyerSection.type";
import { House } from "lucide-react-native";

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
    <View style={common.cardFlat}>
      <View style={common.row}>
        <House size={20} color={"#7a10c0"} style={{ marginBottom: 14 }} />
        <Text style={common.cardFlatTitle}>
          {" "}
          Loyer (Mois: {moisDeLoyerAffiche})
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          Loyer total pour le mois {moisDeLoyerAffiche} (€)
        </Text>
        <TextInput
          style={styles.mainInput}
          keyboardType="decimal-pad"
          {...({ inputMode: "decimal" } as any)}
          value={loyerTotal}
          onChangeText={updateLoyerTotal}
        />
      </View>

      <View style={styles.inputRow}>
        {householdUsers.map((u) => {
          const aplAmount = apportsAPLForm[u.id];

          const handleChangeApl = (text: string) => {
            updateApportsAPLForm(u.id, text);
          };

          return (
            <View key={u.id} style={styles.inputGroupHalf}>
              <Text style={styles.inputLabel}>
                APL {getDisplayName(u.id)} (€)
              </Text>
              <TextInput
                style={styles.mainInput}
                keyboardType="decimal-pad"
                {...({ inputMode: "decimal" } as any)}
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
