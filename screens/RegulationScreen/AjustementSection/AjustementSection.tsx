import React from "react";
import { View, Text, TextInput } from "react-native";
import { styles } from "./AjustementSection.style";
import { AjustementSectionProps } from "./AjustementSection.type";

const AjustementSection: React.FC<AjustementSectionProps> = ({
  householdUsers,
  uid1,
  uid2,
  dettesAjustements,
  updateDettesAjustements,
  getDisplayName,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>💸 Ajustement charges variables</Text>
      <Text style={styles.inputLabel}>
        Saisissez les ajustements des charges variables ce mois-ci.
      </Text>

      {householdUsers.length >= 2 && uid1 && uid2 && (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {getDisplayName(uid1)} doit à {getDisplayName(uid2)} (€)
            </Text>
            <TextInput
              style={styles.mainInput}
              keyboardType="decimal-pad"
              {...({ inputMode: "decimal" } as any)}
              placeholder="0.00"
              value={dettesAjustements[`${uid1}-${uid2}`]}
              onChangeText={(text) =>
                updateDettesAjustements(`${uid1}-${uid2}`, text)
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {getDisplayName(uid2)} doit à {getDisplayName(uid1)} (€)
            </Text>
            <TextInput
              style={styles.mainInput}
              keyboardType="decimal-pad"
              {...({ inputMode: "decimal" } as any)}
              placeholder="0.00"
              value={dettesAjustements[`${uid2}-${uid1}`]}
              onChangeText={(text) =>
                updateDettesAjustements(`${uid2}-${uid1}`, text)
              }
            />
          </View>
        </>
      )}
    </View>
  );
};

export default AjustementSection;
