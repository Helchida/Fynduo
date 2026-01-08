import React from "react";
import { View, Text } from "react-native";
import { styles } from "./ChargesVariablesSection.style";
import { ChargesVariablesSectionProps } from "./ChargesVariablesSection.type";

const ChargesVariablesSection: React.FC<ChargesVariablesSectionProps> = ({
  virements,
  getDisplayName,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>⚖️ Charges Variables (Trésorerie)</Text>

      <View style={styles.container}>
        {virements.length > 0 ? (
          virements.map((v, index) => (
            <View key={`${v.de}-${v.a}-${index}`} style={styles.balanceBadge}>
              <Text style={styles.balanceText}>
                {getDisplayName(v.de)} doit{" "}
                <Text style={styles.amountBold}>{v.montant.toFixed(2)} €</Text>{" "}
                à {getDisplayName(v.a)}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.noDetteBadge}>
            <Text style={styles.noDetteText}>
              ✅ Tout est équilibré sur les variables.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ChargesVariablesSection;
