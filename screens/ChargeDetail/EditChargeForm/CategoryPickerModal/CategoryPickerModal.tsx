import React, { useRef, useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Platform,
  FlatList,
} from "react-native";
import { styles } from "../../../../styles/screens/ChargeDetailScreen/EditChargeForm/CategoryPickerModal/CategoryPickerModal.style";
import { common } from "../../../../styles/common.style";
import { CategoryPickerModalProps } from "./CategoryPickerModal.type";
import {
  CategoryType,
  ICategorie,
  PropagationConflict,
  PropagationResolution,
} from "@/types";
import { useCategories } from "hooks/useCategories";
import { Link2, PlusCircle } from "lucide-react-native";
import EmojiPickerModal, {
  emojiData,
} from "@hiraku-ai/react-native-emoji-picker";

type ModalStep = "form" | "resolving";

export const CategoryPickerModal = ({
  isVisible,
  onClose,
  selectedId,
  onSelect,
  categories,
}: CategoryPickerModalProps) => {
  const {
    removeCategory,
    editCategory,
    getSimilarCategories,
    checkCategoryConflicts,
    createCategoryWithResolutions,
  } = useCategories();

  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newIcon, setNewIcon] = useState("📦");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [suggestion, setSuggestion] = useState<
    (ICategorie & { score: number }) | null
  >(null);
  const suggestionAnim = useRef(new Animated.Value(0)).current;

  const [step, setStep] = useState<ModalStep>("form");
  const [conflicts, setConflicts] = useState<PropagationConflict[]>([]);
  const [resolutions, setResolutions] = useState<
    Record<string, "link" | "create">
  >({});

  const emojiInputRef = useRef<TextInput>(null);

  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);

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
        resetForm();
        return;
      }

      const found = await checkCategoryConflicts(newLabel.trim());

      if (found.length > 0) {
        setConflicts(found);
        const defaults: Record<string, "link" | "create"> = {};
        found.forEach((c) => {
          defaults[c.soloHouseholdId] = "link";
        });
        setResolutions(defaults);
        setStep("resolving");
      } else {
        await createCategoryWithResolutions(newLabel.trim(), newIcon, []);
        resetForm();
      }
    } catch (err: any) {
      setError(err?.message ?? "Une erreur est survenue.");
    }
  };

  const handleConfirmResolutions = async () => {
    setError(null);
    try {
      const resolved: PropagationResolution[] = conflicts.map((c) => ({
        soloHouseholdId: c.soloHouseholdId,
        action: resolutions[c.soloHouseholdId] ?? "create",
        existingCategoryId:
          resolutions[c.soloHouseholdId] === "link"
            ? c.existingCategory.id
            : undefined,
      }));
      await createCategoryWithResolutions(newLabel.trim(), newIcon, resolved);
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
    setStep("form");
    setConflicts([]);
    setResolutions({});
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

  const handleEmojiPicker = (emoji: any) => {
    setNewIcon(emoji);
    setEmojiPickerVisible(false);
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
                else setIsAdding(true);
              }}
            >
              <Text style={{ color: "#3498DB", fontWeight: "600" }}>
                {isAdding ? "Annuler" : "+ Ajouter"}
              </Text>
            </TouchableOpacity>
          </View>

          {isAdding && step === "form" && (
            <View
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#eee",
              }}
            >
              <View style={{ flexDirection: "row", gap: 10, marginBottom: 8 }}>
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    { flex: 0.25, justifyContent: "center" },
                  ]}
                  onPress={() => setEmojiPickerVisible(true)}
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
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#5D6D7E",
                        marginBottom: 2,
                      }}
                    >
                      Catégorie similaire existante :
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#1A5276",
                      }}
                    >
                      {suggestion.icon}
                      {"  "}
                      {suggestion.label}
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
                    <Text
                      style={{ color: "#fff", fontWeight: "600", fontSize: 12 }}
                    >
                      Utiliser
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )}

              {error && (
                <Text
                  style={{ color: "#E74C3C", fontSize: 12, marginBottom: 8 }}
                >
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
                    { flex: 1, backgroundColor: "#3498DB", marginBottom: 0 },
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
          )}

          {isAdding && step === "resolving" && (
            <View style={{ padding: 16 }}>
              <Text
                style={{ fontWeight: "700", fontSize: 15, marginBottom: 4 }}
              >
                Catégories similaires détectées
              </Text>
              <Text
                style={{ color: "#5D6D7E", fontSize: 13, marginBottom: 16 }}
              >
                Des catégories proches existent chez certains membres. Que
                souhaitez-vous faire ?
              </Text>

              <ScrollView style={{ maxHeight: 380 }}>
                {conflicts.map((conflict) => (
                  <View
                    key={conflict.soloHouseholdId}
                    style={{
                      backgroundColor: "#F8F9FA",
                      borderRadius: 10,
                      padding: 12,
                      marginBottom: 12,
                      borderLeftWidth: 3,
                      borderLeftColor: "#3498DB",
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "600",
                        fontSize: 14,
                        marginBottom: 10,
                      }}
                    >
                      {conflict.memberDisplayName}
                    </Text>

                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 10,
                        borderRadius: 8,
                        marginBottom: 6,
                        backgroundColor:
                          resolutions[conflict.soloHouseholdId] === "link"
                            ? "#D6EAF8"
                            : "#fff",
                        borderWidth: 1,
                        borderColor:
                          resolutions[conflict.soloHouseholdId] === "link"
                            ? "#3498DB"
                            : "#DDD",
                      }}
                      onPress={() =>
                        setResolutions((prev) => ({
                          ...prev,
                          [conflict.soloHouseholdId]: "link",
                        }))
                      }
                    >
                      <Link2
                        size={20}
                        color={
                          resolutions[conflict.soloHouseholdId] === "link"
                            ? "#3498DB"
                            : "#AAB7B8"
                        }
                        style={{ marginRight: 8 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: "600", fontSize: 13 }}>
                          Lier « {conflict.existingCategory.label} »
                        </Text>
                        <Text style={{ color: "#5D6D7E", fontSize: 12 }}>
                          Utiliser la catégorie existante comme équivalent
                        </Text>
                      </View>
                      {resolutions[conflict.soloHouseholdId] === "link" && (
                        <Text style={{ color: "#3498DB", fontWeight: "700" }}>
                          ✓
                        </Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 10,
                        borderRadius: 8,
                        backgroundColor:
                          resolutions[conflict.soloHouseholdId] === "create"
                            ? "#FDEBD0"
                            : "#fff",
                        borderWidth: 1,
                        borderColor:
                          resolutions[conflict.soloHouseholdId] === "create"
                            ? "#E67E22"
                            : "#DDD",
                      }}
                      onPress={() =>
                        setResolutions((prev) => ({
                          ...prev,
                          [conflict.soloHouseholdId]: "create",
                        }))
                      }
                    >
                      <PlusCircle
                        size={20}
                        color={"#E67E22"}
                        style={{ marginRight: 8 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: "600", fontSize: 13 }}>
                          Créer « {newLabel.trim()} »
                        </Text>
                        <Text style={{ color: "#5D6D7E", fontSize: 12 }}>
                          Ajouter une nouvelle catégorie dans son foyer
                        </Text>
                      </View>
                      {resolutions[conflict.soloHouseholdId] === "create" && (
                        <Text style={{ color: "#E67E22", fontWeight: "700" }}>
                          ✓
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>

              {error && (
                <Text
                  style={{ color: "#E74C3C", fontSize: 12, marginBottom: 8 }}
                >
                  {error}
                </Text>
              )}

              <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                <TouchableOpacity
                  style={[
                    styles.modalCloseButton,
                    { flex: 1, marginBottom: 0 },
                  ]}
                  onPress={() => setStep("form")}
                >
                  <Text style={styles.modalCloseButtonText}>Retour</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalCloseButton,
                    { flex: 1, backgroundColor: "#2ECC71", marginBottom: 0 },
                  ]}
                  onPress={handleConfirmResolutions}
                >
                  <Text
                    style={{
                      color: "#fff",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Confirmer
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!isAdding && (
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
      <EmojiPickerModal
        visible={emojiPickerVisible}
        onClose={() => setEmojiPickerVisible(false)}
        onEmojiSelect={handleEmojiPicker}
        emojis={emojiData}
        categoryNameMap={{
          "Recently Used": "Récents",
          "Smileys & Emotion": "Smileys & Émotions",
          "People & Body": "Personnes & Corps",
          "Animals & Nature": "Animaux & Nature",
          "Food & Drink": "Nourriture & Boissons",
          "Travel & Places": "Voyages & Lieux",
          Activities: "Activités",
          Objects: "Objets",
          Symbols: "Symboles",
          Flags: "Drapeaux",
        }}
        removeClippedSubviews={Platform.OS === "ios"}
        searchPlaceholder={"Rechercher un Emoji"}
        modalTitle={"Choisir un Emoji"}
        FlatListComponent={(flatListProps: any) => (
          <FlatList
            {...flatListProps}
            ListEmptyComponent={
              !flatListProps.data || flatListProps.data.length === 0 ? (
                <View style={{ padding: 30, alignItems: "center" }}>
                  <Text
                    style={{
                      color: "#7F8C8D",
                      fontSize: 15,
                      fontWeight: "500",
                    }}
                  >
                    Aucun Emoji trouvé
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      />
    </Modal>
  );
};
