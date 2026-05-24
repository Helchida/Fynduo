import React, { useRef, useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
} from "react-native";
import { styles } from "../../../../styles/screens/ChargeDetailScreen/EditChargeForm/CategoryPickerModal/CategoryPickerModal.style";
import { common } from "../../../../styles/common.style";
import { CategoryPickerModalProps } from "./CategoryPickerModal.type";
import { CategoryType, ICategorie } from "@/types";
import { useCategories } from "hooks/useCategories";

export const CategoryPickerModal = ({
  isVisible,
  onClose,
  selectedId,
  onSelect,
  categories,
}: CategoryPickerModalProps) => {
  const { createCategory, removeCategory, editCategory, getSimilarCategories } =
    useCategories();

  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newIcon, setNewIcon] = useState("📦");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [suggestion, setSuggestion] = useState<(ICategorie & { score: number }) | null>(null);
  const suggestionAnim = useRef(new Animated.Value(0)).current;

  const emojiInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!newLabel.trim() || editingId) {
      setSuggestion(null);
      return;
    }

    const matches = getSimilarCategories(newLabel);
    const best = matches[0] ?? null;

    if (best && best.id !== editingId) {
      setSuggestion(best);
      Animated.spring(suggestionAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
      }).start();
    } else {
      Animated.timing(suggestionAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => setSuggestion(null));
    }
  }, [newLabel, editingId]);

  const handleUseSuggestion = () => {
    if (!suggestion) return;
    onSelect(suggestion.id as CategoryType);
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    if (!newLabel.trim()) return;
    setError(null);

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
    } catch (err: any) {
      setError(err?.message ?? "Une erreur est survenue.");
    }
  };

  const resetForm = () => {
    setNewLabel("");
    setNewIcon("📦");
    setEditingId(null);
    setIsAdding(false);
    setError(null);
    setSuggestion(null);
  };

  const handleEmojiInput = (text: string) => {
    if (text.length > 0) {
      const emojis = Array.from(text);
      const lastEmoji = emojis[emojis.length - 1];
      if (lastEmoji) {
        setNewIcon(lastEmoji);
        setTimeout(() => emojiInputRef.current?.blur(), 100);
      }
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={common.modalOverlay}>
        <View style={common.modalContent}>
          <TextInput
            ref={emojiInputRef}
            style={{ position: "absolute", opacity: 0, height: 0, width: 0 }}
            value=""
            onChangeText={handleEmojiInput}
            keyboardType="default"
            autoCorrect={false}
            autoCapitalize="none"
            disableFullscreenUI={true}
            textContentType="none"
            spellCheck={false}
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
            <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" }}>
              <View style={{ flexDirection: "row", gap: 10, marginBottom: 8 }}>
                <TouchableOpacity
                  style={[styles.modalItem, { flex: 0.25, justifyContent: "center" }]}
                  onPress={() => emojiInputRef.current?.focus()}
                >
                  <Text style={{ fontSize: 30 }}>{newIcon}</Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.modalItem, { flex: 0.8 }]}
                  value={newLabel}
                  onChangeText={(text) => {
                    setNewLabel(text);
                    setError(null);
                  }}
                  placeholder="Nom de la catégorie"
                  autoFocus
                />
              </View>

              {suggestion && (
                <Animated.View
                  style={{
                    opacity: suggestionAnim,
                    transform: [
                      {
                        translateY: suggestionAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-8, 0],
                        }),
                      },
                    ],
                    backgroundColor: "#EBF5FB",
                    borderRadius: 8,
                    padding: 10,
                    marginBottom: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderLeftWidth: 3,
                    borderLeftColor: "#3498DB",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: "#5D6D7E", marginBottom: 2 }}>
                      Catégorie similaire existante :
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#1A5276" }}>
                      {suggestion.icon}  {suggestion.label}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleUseSuggestion}
                    style={{
                      backgroundColor: "#3498DB",
                      borderRadius: 6,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      marginLeft: 8,
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "600", fontSize: 12 }}>
                      Utiliser
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )}

              {error && (
                <Text style={{ color: "#E74C3C", fontSize: 12, marginBottom: 8 }}>
                  {error}
                </Text>
              )}

              <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
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
                    <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
                      Supprimer
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[
                    styles.modalCloseButton,
                    { flex: 1, backgroundColor: "#3498DB", marginBottom: 0 },
                  ]}
                  onPress={handleSave}
                >
                  <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
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
                    <Text style={{ color: "#3498DB", fontWeight: "bold" }}>✓</Text>
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