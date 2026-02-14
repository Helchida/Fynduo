import React, { useEffect, useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { styles } from "./HouseholdsScreen.style";
import { useAuth } from "hooks/useAuth";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import {
  createHousehold,
  generateInvitationCode,
  joinHouseholdByCode,
  leaveHousehold,
  switchActiveHousehold,
  updateHouseholdName,
} from "services/supabase/db";
import {
  Plus,
  UserPlus,
  Pencil,
  LogOut,
  Share2,
  Check,
} from "lucide-react-native";
import { ConfirmModal } from "components/ui/ConfirmModal/ConfirmModal";
import { supabase } from "services/supabase/config";

const HouseholdsScreen: React.FC = () => {
  const { user, updateLocalActiveHousehold } = useAuth();
  if (!user) return <NoAuthenticatedUser />;

  const [householdData, setHouseholdData] = useState<
    Record<string, { name: string; memberCount: number }>
  >({});

  const [isActionModalVisible, setActionModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "join" | "rename">(
    "create"
  );
  const [inputValue, setInputValue] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    isDestructive?: boolean;
  }>({
    visible: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  useEffect(() => {
  if (!user?.households) return;

  const channels: any[] = [];
  let isMounted = true;

  const loadHouseholds = async () => {
    for (const hId of user.households) {
      if (!isMounted) return;
      
      if (hId === user.id) {
        setHouseholdData((prev) => ({
          ...prev,
          [hId]: { name: "Mon Foyer Solo", memberCount: 1 },
        }));
      } else {
        const { data, error } = await supabase
          .from('households')
          .select('*')
          .eq('id', hId)
          .single();

        if (data && !error && isMounted) {
          setHouseholdData((prev) => ({
            ...prev,
            [hId]: {
              name: data.name || `Foyer (${hId.substring(0, 4)})`,
              memberCount: data.members?.length || 0,
            },
          }));

          const channel = supabase
            .channel(`household-${hId}`) 
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'households',
                filter: `id=eq.${hId}`,
              },
              (payload) => {
                if (!isMounted) return;
                const newData = payload.new as any;
                if (newData) {
                  setHouseholdData((prev) => ({
                    ...prev,
                    [hId]: {
                      name: newData.name || `Foyer (${hId.substring(0, 4)})`,
                      memberCount: newData.members?.length || 0,
                    },
                  }));
                }
              }
            )
            .subscribe();

          channels.push(channel);
        }
      }
    }
  };

  loadHouseholds();

  return () => {
    isMounted = false;
    channels.forEach((channel) => supabase.removeChannel(channel));
  };
}, [user?.households]);

  const handleAction = async () => {
    if (!inputValue.trim() || !user) return;
    setLoading(true);
    try {
      if (modalMode === "create") {
        const newId = await createHousehold(user.id, inputValue);
        await switchActiveHousehold(user.id, newId);
        updateLocalActiveHousehold(newId);
      } else if (modalMode === "join") {
        const newId = await joinHouseholdByCode(user.id, inputValue);
        if (newId) {
          await switchActiveHousehold(user.id, newId);
          updateLocalActiveHousehold(newId);
        }
      } else if (modalMode === "rename" && selectedId) {
        await updateHouseholdName(selectedId, inputValue);
      }

      setActionModalVisible(false);
      setInputValue("");
    } catch (error: any) {
      setConfirmConfig({
        visible: true,
        title: "Erreur",
        message:
          error.message ||
          "L'opération a échoué. Vérifiez vos permissions ou le code saisi.",
        onConfirm: () =>
          setConfirmConfig((prev) => ({ ...prev, visible: false })),
        confirmText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  const requestLeave = (hId: string) => {
    setConfirmConfig({
      visible: true,
      title: "Quitter le foyer",
      message:
        "Voulez-vous vraiment quitter ce foyer ? Cette action est immédiate.",
      confirmText: "Quitter",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await leaveHousehold(user.id, hId);
          setConfirmConfig((prev) => ({ ...prev, visible: false }));
        } catch (e) {
          alert("Erreur lors de la sortie");
        }
      },
    });
  };

  const handleShareCode = async (hId: string) => {
    try {
      const code = await generateInvitationCode(hId);
      if (!code) return;

      const shareText = `Rejoins mon foyer sur Fynduo ! Code : ${code}`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: "Invitation Fynduo",
            text: shareText,
          });
        } catch (err) {
          showCodeModal(code);
        }
      } else {
        showCodeModal(code);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const showCodeModal = (code: string) => {
    navigator.clipboard.writeText(code);
    setConfirmConfig({
      visible: true,
      title: "Code d'invitation",
      message: `Le code ${code} a été copié. Partagez-le avec votre partenaire !`,
      confirmText: "C'est fait",
      onConfirm: () =>
        setConfirmConfig((prev) => ({ ...prev, visible: false })),
    });
  };

  const handleSwitchHousehold = async (hId: string) => {
    if (user.activeHouseholdId === hId) return;

    try {
      await switchActiveHousehold(user.id, hId);
      updateLocalActiveHousehold(hId);
    } catch (error) {
      alert("Erreur lors du changement de foyer");
    }
  };

  if (!user) return <NoAuthenticatedUser />;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setModalMode("create");
            setInputValue("");
            setActionModalVisible(true);
          }}
        >
          <Plus size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Créer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.joinButton]}
          onPress={() => {
            setModalMode("join");
            setInputValue("");
            setActionModalVisible(true);
          }}
        >
          <UserPlus size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Rejoindre</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {user.households?.map((hId) => {
          if (hId === user.id) return null;
          const isActive = hId === user.activeHouseholdId;
          const info = householdData[hId];

          return (
            <View
              key={hId}
              style={[
                styles.householdItem,
                isActive && styles.activeHouseholdItem,
              ]}
            >
              <TouchableOpacity
                style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                onPress={() => handleSwitchHousehold(hId)}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.householdItemText,
                      isActive && styles.activeHouseholdText,
                    ]}
                  >
                    {info?.name || "Chargement..."}
                  </Text>

                  {info && (
                    <Text
                      style={{ fontSize: 12, color: "#7f8c8d", marginTop: 2 }}
                    >
                      {info.memberCount}{" "}
                      {info.memberCount > 1 ? "personnes" : "personne"}
                    </Text>
                  )}
                </View>

                {isActive && <Check size={18} color="#3498db" />}
              </TouchableOpacity>

              <View style={styles.itemActions}>
                <TouchableOpacity
                  onPress={() => handleShareCode(hId)}
                  style={styles.iconPadding}
                >
                  <Share2 size={18} color="#3498db" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedId(hId);
                    setInputValue(householdData[hId]?.name || "");
                    setModalMode("rename");
                    setActionModalVisible(true);
                  }}
                  style={styles.iconPadding}
                >
                  <Pencil size={18} color="#95a5a6" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => requestLeave(hId)}
                  style={styles.iconPadding}
                >
                  <LogOut size={18} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={isActionModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalMode === "create"
                ? "Nouveau foyer"
                : modalMode === "join"
                ? "Rejoindre un foyer"
                : "Renommer"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={
                modalMode === "join" ? "Code d'invitation" : "Nom du foyer"
              }
              value={inputValue}
              onChangeText={setInputValue}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setActionModalVisible(false)}
                disabled={loading}
              >
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleAction}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>Valider</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={confirmConfig.visible}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        isDestructive={confirmConfig.isDestructive}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() =>
          setConfirmConfig((prev) => ({ ...prev, visible: false }))
        }
      />
    </View>
  );
};

export default HouseholdsScreen;
