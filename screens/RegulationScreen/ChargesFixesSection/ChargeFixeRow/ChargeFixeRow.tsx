import { TextInput, TouchableOpacity, View, Text } from "react-native";
import { styles } from "./ChargeFixeRow.style";
import { ChargeFixeRowProps } from "./ChargeFixeRow.type";
import { useState } from "react";
import { ConfirmModal } from "components/ui/ConfirmModal/ConfirmModal";

const ChargeFixeRow: React.FC<ChargeFixeRowProps> = ({
  charge,
  onUpdate,
  onDelete,
}) => {
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  return (
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
        onPress={() => setIsDeleteModalVisible(true)}
      >
        <Text style={styles.deleteButtonText}>X</Text>
      </TouchableOpacity>

      <ConfirmModal
        visible={isDeleteModalVisible}
        title="Supprimer la charge"
        message={`Voulez-vous vraiment supprimer "${charge.nom}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        isDestructive={true}
        onConfirm={async () => {
          setIsDeleteModalVisible(false);
          await onDelete(charge.id);
        }}
        onCancel={() => setIsDeleteModalVisible(false)}
      />
    </View>
  );
};

export default ChargeFixeRow;
