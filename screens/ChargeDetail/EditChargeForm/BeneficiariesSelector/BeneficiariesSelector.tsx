import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Lock, RotateCcw } from "lucide-react-native";
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
  const [localTaux, setLocalTaux] = useState<Record<string, string>>({});
  const [localMontant, setLocalMontant] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const getTauxDisplay = (uid: string, computedTaux: number) => {
    const key = `${uid}-taux`;
    if (focusedField === key && localTaux[uid] !== undefined) {
      return localTaux[uid];
    }
    return computedTaux.toFixed(1);
  };

  const getMontantDisplay = (uid: string, computedMontant: number) => {
    const key = `${uid}-montant`;
    if (focusedField === key && localMontant[uid] !== undefined) {
      return localMontant[uid];
    }
    return computedMontant.toFixed(2);
  };

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
        <TouchableOpacity
          onPress={() => {
            setLocalTaux({});
            setLocalMontant({});
            setFocusedField(null);
            onReset();
          }}
          style={styles.resetButton}
          activeOpacity={0.7}
        >
          <RotateCcw size={12} color="#27ae60" />
          <Text style={styles.resetButtonText}>Réinitialiser la répartition</Text>
        </TouchableOpacity>
      )}

      

      {users.map((u) => {
        const isSelected = selectedUids.includes(u.id);
        const isLocked = lockedUids.includes(u.id);
        const montant = isSelected ? (repartition[u.id] ?? 0) : 0;
        const taux = isSelected && amountNum > 0 ? (montant / amountNum) * 100 : 0;

        const tauxKey = `${u.id}-taux`;
        const montantKey = `${u.id}-montant`;

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
                  value={getTauxDisplay(u.id, taux)}
                  onFocus={() => {
                    setFocusedField(tauxKey);
                    setLocalTaux((prev) => ({
                      ...prev,
                      [u.id]: taux.toFixed(1),
                    }));
                  }}
                  onChangeText={(txt) => {
                    setLocalTaux((prev) => ({ ...prev, [u.id]: txt }));
                    const val = parseFloat(txt.replace(",", "."));
                    if (!isNaN(val)) onChangeTaux(u.id, val);
                  }}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="decimal-pad"
                  {...({ inputMode: "decimal" } as any)}
                  selectTextOnFocus
                />
                <Text style={styles.partInputUnit}>%</Text>
                <TextInput
                  style={styles.partInputMontant}
                  value={getMontantDisplay(u.id, montant)}
                  onFocus={() => {
                    setFocusedField(montantKey);
                    setLocalMontant((prev) => ({
                      ...prev,
                      [u.id]: montant.toFixed(2),
                    }));
                  }}
                  onChangeText={(txt) => {
                    setLocalMontant((prev) => ({ ...prev, [u.id]: txt }));
                    const val = parseFloat(txt.replace(",", "."));
                    if (!isNaN(val)) onChangeMontant(u.id, val);
                  }}
                  onBlur={() => setFocusedField(null)}
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

      {hasError && <Text style={styles.errorText}>{hasError}</Text>}
    </View>
  );
};