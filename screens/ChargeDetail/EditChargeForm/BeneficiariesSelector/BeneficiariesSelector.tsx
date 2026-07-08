import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Lock } from "lucide-react-native";
import { styles } from "../../../../styles/screens/ChargeDetailScreen/EditChargeForm/BeneficiariesSelector/BeneficiariesSelector.style";
import { common } from "../../../../styles/common.style";
import { BeneficiariesSelectorProps } from "./BeneficiariesSelector.type";

export const BeneficiariesSelector = ({
  users,
  selectedUids,
  totalAmount,
  onToggle,
  getDisplayName,
  currentUserId,
  splitMode,
  onSplitModeChange,
  repartition,
  lockedUids,
  onChangeMontant,
  onChangeTaux,
  onReset,
  hasError,
}: BeneficiariesSelectorProps) => {
  const amountNum = parseFloat(totalAmount.replace(",", ".")) || 0;

  return (
    <View style={[common.formContainer, common.payorCard]}>
      <View style={styles.headerRow}>
        <Text style={common.editLabel}>Diviser</Text>

        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              splitMode === "egal" && styles.modeButtonActive,
            ]}
            onPress={() => onSplitModeChange("egal")}
          >
            <Text
              style={[
                styles.modeButtonText,
                splitMode === "egal" && styles.modeButtonTextActive,
              ]}
            >
              Également
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              splitMode === "part" && styles.modeButtonActive,
            ]}
            onPress={() => onSplitModeChange("part")}
          >
            <Text
              style={[
                styles.modeButtonText,
                splitMode === "part" && styles.modeButtonTextActive,
              ]}
            >
              Part
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {splitMode === "part" && lockedUids.length > 0 && (
        <TouchableOpacity onPress={onReset} style={styles.resetLink}>
          <Text style={styles.resetLinkText}>Réinitialiser la répartition</Text>
        </TouchableOpacity>
      )}

      {hasError && <Text style={styles.errorText}>{hasError}</Text>}

      {users.map((u) => {
        const isSelected = selectedUids.includes(u.id);
        const isLocked = lockedUids.includes(u.id);
        const montant = isSelected ? (repartition[u.id] ?? 0) : 0;
        const taux = isSelected && amountNum > 0 ? (montant / amountNum) * 100 : 0;

        return (
          <View key={u.id} style={styles.beneficiaryRow}>
            <TouchableOpacity
              style={styles.beneficiaryLabelZone}
              onPress={() => onToggle(u.id)}
            >
              <View
                style={[styles.checkbox, isSelected && styles.checkboxChecked]}
              >
                {isSelected && (
                  <Text style={{ color: "#fff", fontSize: 10 }}>✓</Text>
                )}
              </View>
              <Text
                style={[
                  styles.beneficiaryName,
                  !isSelected && { color: "#666" },
                ]}
              >
                {getDisplayName(u.id)} {u.id === currentUserId ? "(Moi)" : ""}
              </Text>
              {isLocked && splitMode === "part" && isSelected && (
                <Lock size={12} color="#27ae60" style={{ marginLeft: 6 }} />
              )}
            </TouchableOpacity>

            {splitMode === "egal" || !isSelected ? (
              <Text
                style={[
                  styles.beneficiaryAmount,
                  !isSelected && { color: "#666" },
                ]}
              >
                {montant.toFixed(2).replace(".", ",")} €
              </Text>
            ) : (
              <View style={styles.partInputsRow}>
                <TextInput
                  style={styles.partInputTaux}
                  value={taux.toFixed(1)}
                  onChangeText={(txt) => {
                    const val = parseFloat(txt.replace(",", "."));
                    if (!isNaN(val)) onChangeTaux(u.id, val);
                  }}
                  keyboardType="decimal-pad"
                  {...({ inputMode: "decimal" } as any)}
                  selectTextOnFocus
                />
                <Text style={styles.partInputUnit}>%</Text>
                <TextInput
                  style={styles.partInputMontant}
                  value={montant.toFixed(2)}
                  onChangeText={(txt) => {
                    const val = parseFloat(txt.replace(",", "."));
                    if (!isNaN(val)) onChangeMontant(u.id, val);
                  }}
                  keyboardType="decimal-pad"
                  {...({ inputMode: "decimal" } as any)}
                  selectTextOnFocus
                />
                <Text style={styles.partInputUnit}>€</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};
