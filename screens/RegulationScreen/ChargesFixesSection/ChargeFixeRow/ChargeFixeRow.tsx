import { TextInput, TouchableOpacity, View, Text } from "react-native";
import { styles } from "./ChargeFixeRow.style";
import { ChargeFixeRowProps } from "./ChargeFixeRow.type";

const ChargeFixeRow: React.FC<ChargeFixeRowProps> = ({
  charge,
  onUpdate,
  onDelete,
}) => (
  <View style={styles.chargeRow}>
    <TextInput
      style={[styles.input, styles.descriptionInput]}
      placeholder="Description (ex: Gaz)"
      value={charge.nom}
      editable={charge.isNew}
      onChangeText={(text) => onUpdate(charge.id, "nom", text)}
    />
    <TextInput
      style={[styles.input, styles.montantInput]}
      placeholder="Montant (€)"
      keyboardType="decimal-pad"
      {...({ inputMode: "decimal" } as any)}
      value={charge.montantForm}
      onChangeText={(text) =>
        onUpdate(charge.id, "montantForm", text.replace(",", "."))
      }
    />
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => onDelete(charge.id)}
    >
      <Text style={styles.deleteButtonText}>X</Text>
    </TouchableOpacity>
  </View>
);

export default ChargeFixeRow;
