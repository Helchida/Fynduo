import React, { useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { styles } from "./CategoryPickerModal.style";
import { CategoryPickerModalProps } from "./CategoryPickerModal.type";
import { CategoryType } from "@/types";
import { useCategories } from "hooks/useCategories";

export const CategoryPickerModal = ({
  isVisible,
  onClose,
  selectedId,
  onSelect,
  categories,
}: CategoryPickerModalProps) => {
  const { createCategory, removeCategory, editCategory } = useCategories();
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newIcon, setNewIcon] = useState("📦");
  const [editingId, setEditingId] = useState<string | null>(null);
  const emojiInputRef = useRef<TextInput>(null);

  const handleSave = async () => {
    if (!newLabel.trim()) return;

    try {
      if (editingId) {
        await editCategory(editingId, {
          label: newLabel.trim(),
          icon: newIcon,
        });
      } else {
        await createCategory(newLabel.trim(), newIcon);
      }

      resetForm();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
    }
  };
  const resetForm = () => {
    setNewLabel("");
    setNewIcon("📦");
    setEditingId(null);
    setIsAdding(false);
  };

  const handleEmojiInput = (text: string) => {
    if (text.length > 0) {
      const lastChar = Array.from(text).pop();
      if (lastChar) setNewIcon(lastChar);
    }
  };
  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TextInput
            ref={emojiInputRef}
            style={{ position: "absolute", opacity: 0, height: 0, width: 0 }}
            value=""
            onChangeText={handleEmojiInput}
            keyboardType="default"
          />
          <View style={styles.modalHeaderContainer}>
            <Text style={styles.modalHeader}>Choisir une catégorie</Text>
            <TouchableOpacity
              onPress={() => {
                if (isAdding) resetForm();
                setIsAdding(!isAdding);
              }}
            >
              <Text style={{ color: "#3498DB", fontWeight: "600" }}>
                {isAdding ? "Annuler" : "+ Ajouter"}
              </Text>
            </TouchableOpacity>
          </View>
          {isAdding ? (
            <View
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#eee",
              }}
            >
              <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    { flex: 0.25, justifyContent: "center" },
                  ]}
                  onPress={() => emojiInputRef.current?.focus()}
                >
                  <Text style={{ fontSize: 30 }}>{newIcon}</Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.modalItem, { flex: 0.8 }]}
                  value={newLabel}
                  onChangeText={setNewLabel}
                  placeholder="Nom de la catégorie"
                  autoFocus
                />
              </View>
              <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                {editingId && (
                  <TouchableOpacity
                    style={[
                      styles.modalCloseButton,
                      { flex: 1, backgroundColor: "#E74C3C", marginBottom: 0 },
                    ]}
                    onPress={async () => {
                      await removeCategory(editingId);
                      resetForm();
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        textAlign: "center",
                        fontWeight: "600",
                      }}
                    >
                      Supprimer
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.modalCloseButton,
                    {
                      flex: 1,
                      backgroundColor: "#3498DB",
                      marginBottom: 0,
                    },
                  ]}
                  onPress={handleSave}
                >
                  <Text
                    style={{
                      color: "#fff",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    {editingId ? "Mettre à jour" : "Enregistrer"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <ScrollView>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.modalItem,
                    selectedId === cat.id && styles.modalItemSelected,
                  ]}
                  onPress={() => onSelect(cat.id as CategoryType)}
                  onLongPress={() => {
                    if (cat.isDefault) return;
                    setEditingId(cat.id);
                    setNewLabel(cat.label);
                    setNewIcon(cat.icon);
                    setIsAdding(true);
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
                    <Text style={styles.modalItemText}>{cat.label}</Text>
                  </View>
                  {selectedId === cat.id && (
                    <Text style={{ color: "#3498DB", fontWeight: "bold" }}>
                      ✓
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
