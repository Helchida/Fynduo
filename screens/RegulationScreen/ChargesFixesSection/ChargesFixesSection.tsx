import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import ChargeFixeRow from "./ChargeFixeRow/ChargeFixeRow";
import { styles } from "../../../styles/screens/RegulationScreen/ChargesFixesSection/ChargesFixesSection.style";
import { common } from "styles/common.style";
import { ChargesFixesSectionProps } from "./ChargesFixesSection.type";
import { Settings } from "lucide-react-native";

const ChargesFixesSection: React.FC<ChargesFixesSectionProps> = ({
  householdUsers,
  chargesFormMap,
  getDisplayName,
  handleAddCharge,
  updateChargeForm,
  handleDeleteCharge,
}) => {
  return (
    <View style={common.cardFlat}>
      <View style={common.row}>
          <Settings size={20} color={"#747275"} style={{ marginBottom: 14 }} />
      <Text style={common.cardFlatTitle}>{" "}Charges Fixes</Text>
      </View>

      {householdUsers.map((u) => (
        <View key={u.id} style={styles.subSection}>
          <View style={styles.subSectionHeader}>
            <Text style={styles.subSectionTitle}>
              Charges {getDisplayName(u.id)}
            </Text>
            <TouchableOpacity
              onPress={() => handleAddCharge(u.id)}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>
          {chargesFormMap[u.id] &&
            chargesFormMap[u.id].map((charge) => (
              <ChargeFixeRow
                key={charge.id}
                charge={charge}
                onUpdate={updateChargeForm(u.id)}
                onDelete={(id) => handleDeleteCharge(id, u.id)}
              />
            ))}
        </View>
      ))}
    </View>
  );
};

export default ChargesFixesSection;
