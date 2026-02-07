import React from "react";
import { View, Text } from "react-native";
import { styles } from "./ChargesSection.style";
import { ChargesSectionProps } from "./ChargesSection.type";

const ChargesSection: React.FC<ChargesSectionProps> = ({
  virements,
  getDisplayName,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>⚖️ Charges (Dépenses)</Text>

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
              ✅ Tout est équilibré sur les dépenses.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ChargesSection;
