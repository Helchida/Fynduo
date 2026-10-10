import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import dayjs from "dayjs";
import { Pencil, PlusCircle, ReceiptText, Trash2, WalletCards } from "lucide-react-native";
import { useAuth } from "hooks/useAuth";
import { useNavigation } from "@react-navigation/native";
import { useCategories } from "hooks/useCategories";
import { useComptes } from "hooks/useComptes";
import { useToast } from "hooks/useToast";
import { ConfirmModal } from "components/ui/ConfirmModal/ConfirmModal";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { IBudget, IBudgetPeriodSnapshot, RootStackNavigationProp } from "@/types";
import * as DB from "services/supabase/db";
import { formatEuro, getBudgetTotals, parseEuroAmount } from "utils/budgets";
import { FinancialPeriod } from "utils/financialPeriods";
import { colors, radius, shadows, spacing, typography } from "styles/theme.style";
import { common } from "styles/common.style";

const calendarPeriod = (): FinancialPeriod => ({
  id: `calendar-${dayjs().format("YYYY-MM")}`,
  start: dayjs().startOf("month").format("YYYY-MM-DD"),
  end: dayjs().endOf("month").format("YYYY-MM-DD"),
  label: dayjs().format("MMMM YYYY"),
  isOpen: true,
});

const emptyDraft = { name: "", amount: "", categoryIds: [] as string[] };

const BudgetsScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { categories, isLoadingCategories } = useCategories();
  const { charges, financialPeriods } = useComptes();
  const toast = useToast();
  const [budgets, setBudgets] = useState<IBudget[]>([]);
  const [snapshots, setSnapshots] = useState<IBudgetPeriodSnapshot[]>([]);
  const [selectedPeriodKey, setSelectedPeriodKey] = useState<"active" | string>("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState<IBudget | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [budgetToDelete, setBudgetToDelete] = useState<IBudget | null>(null);
  const isSolo = user?.activeHouseholdId === user?.id;
  const currentPeriod = useMemo(
    () => (isSolo && financialPeriods.length
      ? financialPeriods.find((period) => period.isOpen) ?? financialPeriods[financialPeriods.length - 1]
      : calendarPeriod()),
    [financialPeriods, isSolo],
  );
  const periodKey = isSolo && financialPeriods.length ? `pay:${currentPeriod.id}` : `calendar:${dayjs().format("YYYY-MM")}`;
  const historicalPeriods = useMemo(
    () => financialPeriods.filter((period) => !period.isOpen && snapshots.some((snapshot) => snapshot.periodKey === `pay:${period.id}`)),
    [financialPeriods, snapshots],
  );
  const selectedSnapshots = useMemo(
    () => snapshots.filter((snapshot) => snapshot.periodKey === selectedPeriodKey),
    [snapshots, selectedPeriodKey],
  );
  const isHistorical = selectedPeriodKey !== "active";

  const refresh = useCallback(async () => {
    if (!user?.activeHouseholdId || !isSolo) return;
    try {
      setLoading(true);
      setError(null);
      const [result, history] = await Promise.all([
        DB.getBudgets(user.activeHouseholdId),
        DB.getBudgetPeriodSnapshots(user.activeHouseholdId),
      ]);
      setBudgets(result);
      setSnapshots(history);
    } catch (cause) {
      setError("Impossible de charger les budgets.");
      console.error("getBudgets", cause);
    } finally {
      setLoading(false);
    }
  }, [user?.activeHouseholdId, isSolo]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    if (user && !isSolo) navigation.navigate("Home");
  }, [isSolo, navigation, user]);

  if (!user) return <NoAuthenticatedUser />;
  if (!isSolo) return <View style={styles.restricted}><Text style={styles.restrictedTitle}>Budgets personnels</Text><Text style={styles.emptyText}>Les budgets sont disponibles uniquement dans votre foyer solo.</Text></View>;

  const openCreate = () => {
    setEditingBudget(null);
    setDraft(emptyDraft);
    setModalVisible(true);
  };
  const openEdit = (budget: IBudget) => {
    setEditingBudget(budget);
    setDraft({ name: budget.name, amount: budget.initialAmount.toFixed(2), categoryIds: budget.categoryIds });
    setModalVisible(true);
  };
  const assignedToOtherBudget = (categoryId: string) => budgets.some((budget) => budget.id !== editingBudget?.id && budget.categoryIds.includes(categoryId));
  const toggleCategory = (categoryId: string) => {
    if (assignedToOtherBudget(categoryId)) return;
    setDraft((value) => ({ ...value, categoryIds: value.categoryIds.includes(categoryId)
      ? value.categoryIds.filter((id) => id !== categoryId)
      : [...value.categoryIds, categoryId] }));
  };
  const save = async () => {
    const amount = parseEuroAmount(draft.amount);
    if (!draft.name.trim()) return toast.error("Nom requis", "Indiquez un nom pour le budget.");
    if (amount === null) return toast.error("Montant invalide", "Utilisez un montant en euros avec deux décimales au maximum.");
    if (!draft.categoryIds.length) return toast.error("Catégorie requise", "Sélectionnez au moins une catégorie.");
    const duplicate = draft.categoryIds.find(assignedToOtherBudget);
    if (duplicate) return toast.error("Catégorie déjà attribuée", "Cette catégorie appartient déjà à un autre budget de ce foyer.");
    const budget: Omit<IBudget, "householdId"> = {
      id: editingBudget?.id ?? `budget_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      name: draft.name.trim(), initialAmount: amount, categoryIds: draft.categoryIds,
    };
    try {
      await DB.saveBudget(user.activeHouseholdId, budget, periodKey);
      setModalVisible(false);
      await refresh();
      toast.success(editingBudget ? "Budget modifié" : "Budget créé");
    } catch (cause) {
      console.error("saveBudget", cause);
      toast.error("Impossible d’enregistrer", "Vérifiez les catégories sélectionnées puis réessayez.");
    }
  };
  const remove = async () => {
    if (!budgetToDelete) return;
    try {
      await DB.deleteBudget(user.activeHouseholdId, budgetToDelete.id, periodKey);
      setBudgetToDelete(null);
      await refresh();
      toast.success("Budget supprimé");
    } catch (cause) {
      console.error("deleteBudget", cause);
      toast.error("Impossible de supprimer le budget");
    }
  };

  return <View style={styles.page}>
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <WalletCards color="#0f766e" size={28} />
        <View style={{ flex: 1 }}><Text style={styles.title}>Budgets</Text><Text style={styles.subtitle}>Suivi de {currentPeriod.label}</Text></View>
        {!isHistorical && <TouchableOpacity accessibilityLabel="Créer un budget" style={styles.addButton} onPress={openCreate}><PlusCircle color="#fff" size={19} /><Text style={styles.addText}>Créer</Text></TouchableOpacity>}
      </View>
      {(historicalPeriods.length > 0 || isHistorical) && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodSelector}>
        <TouchableOpacity onPress={() => setSelectedPeriodKey("active")} style={[styles.periodButton, !isHistorical && styles.periodButtonActive]}><Text style={[styles.periodText, !isHistorical && styles.periodTextActive]}>Période active</Text></TouchableOpacity>
        {historicalPeriods.map((period) => <TouchableOpacity key={period.id} onPress={() => setSelectedPeriodKey(`pay:${period.id}`)} style={[styles.periodButton, selectedPeriodKey === `pay:${period.id}` && styles.periodButtonActive]}><Text style={[styles.periodText, selectedPeriodKey === `pay:${period.id}` && styles.periodTextActive]}>{period.label}</Text></TouchableOpacity>)}
      </ScrollView>}
      {isSolo && !financialPeriods.length && <View style={styles.info}><Text style={styles.infoText}>Aucune période de paie active : les budgets suivent le mois civil jusqu’à la prochaine paie de référence.</Text></View>}
      {loading || isLoadingCategories ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : error ? <View style={styles.empty}><Text>{error}</Text><TouchableOpacity onPress={refresh}><Text style={styles.retry}>Réessayer</Text></TouchableOpacity></View> : isHistorical ? selectedSnapshots.length === 0 ? <View style={styles.empty}><Text style={styles.emptyTitle}>Aucun budget pour cette période</Text></View> : selectedSnapshots.map((snapshot) => {
        const incomplete = snapshot.spentAmount === null || snapshot.remainingAmount === null;
        const exceeded = !incomplete && (snapshot.remainingAmount ?? 0) < 0;
        const progress = incomplete || snapshot.initialAmount === 0 ? 0 : Math.min(100, ((snapshot.spentAmount ?? 0) / snapshot.initialAmount) * 100);
        return <View key={snapshot.id} style={[styles.card, exceeded && styles.cardExceeded]}><View style={styles.cardHeader}><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{snapshot.name}</Text><Text style={styles.categoryText}>{snapshot.categoryIds.map((id) => categories.find((category) => category.id === id)?.label ?? "Catégorie supprimée").join(" · ")}</Text></View></View>{incomplete ? <Text style={styles.incomplete}>Dépenses et montant restant indisponibles : ils n’étaient pas enregistrés à la clôture de cette ancienne période.</Text> : <><Text style={[styles.remaining, exceeded && styles.remainingExceeded]}>Montant restant : {formatEuro(snapshot.remainingAmount ?? 0)} sur {formatEuro(snapshot.initialAmount)}</Text><View style={styles.track}><View style={[styles.bar, { width: `${progress}%` }, exceeded && styles.barExceeded]} /></View><View style={styles.amounts}><Text style={styles.amountLabel}>Dépensé <Text style={styles.amountValue}>{formatEuro(snapshot.spentAmount ?? 0)}</Text></Text><Text style={styles.amountLabel}>Montant initial <Text style={styles.amountValue}>{formatEuro(snapshot.initialAmount)}</Text></Text></View></>}</View>;
      }) : budgets.length === 0 ? <View style={styles.empty}><ReceiptText color="#0f766e" size={36} /><Text style={styles.emptyTitle}>Aucun budget</Text><Text style={styles.emptyText}>Créez un budget pour suivre vos dépenses par catégorie.</Text></View> : budgets.map((budget) => {
        const totals = getBudgetTotals(budget.initialAmount, budget.categoryIds, charges, currentPeriod, { isSoloMode: true, currentUserId: user.id });
        const exceeded = totals.remainingAmount < 0;
        const progress = totals.initialAmount === 0 ? (totals.spentAmount ? 100 : 0) : Math.min(100, (totals.spentAmount / totals.initialAmount) * 100);
        return <View key={budget.id} style={[styles.card, exceeded && styles.cardExceeded]}>
          <View style={styles.cardHeader}><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{budget.name}</Text><Text style={styles.categoryText}>{budget.categoryIds.map((id) => categories.find((category) => category.id === id)?.label ?? "Catégorie supprimée").join(" · ")}</Text></View><TouchableOpacity onPress={() => openEdit(budget)} style={styles.iconButton}><Pencil color={colors.primary} size={18} /></TouchableOpacity><TouchableOpacity onPress={() => setBudgetToDelete(budget)} style={styles.iconButton}><Trash2 color={colors.danger} size={18} /></TouchableOpacity></View>
          <Text style={[styles.remaining, exceeded && styles.remainingExceeded]}>Montant restant : {formatEuro(totals.remainingAmount)} sur {formatEuro(totals.initialAmount)}</Text>
          <View style={styles.track}><View style={[styles.bar, { width: `${progress}%` }, exceeded && styles.barExceeded]} /></View>
          <View style={styles.amounts}><Text style={styles.amountLabel}>Dépensé <Text style={styles.amountValue}>{formatEuro(totals.spentAmount)}</Text></Text><Text style={styles.amountLabel}>Montant initial <Text style={styles.amountValue}>{formatEuro(totals.initialAmount)}</Text></Text></View>
          {exceeded && <Text style={styles.exceeded}>Budget dépassé de {formatEuro(Math.abs(totals.remainingAmount))}.</Text>}
        </View>;
      })}
    </ScrollView>
    <Modal visible={modalVisible && !isHistorical} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}><View style={styles.overlay}><View style={styles.modal}><Text style={styles.modalTitle}>{editingBudget ? "Modifier le budget" : "Créer un budget"}</Text><Text style={styles.label}>Nom</Text><TextInput style={styles.input} value={draft.name} onChangeText={(name) => setDraft((value) => ({ ...value, name }))} placeholder="ex : Courses" /><Text style={styles.label}>Montant initial (€)</Text><TextInput style={styles.input} keyboardType="decimal-pad" value={draft.amount} onChangeText={(amount) => setDraft((value) => ({ ...value, amount }))} placeholder="ex : 150,00" /><Text style={styles.label}>Catégories associées</Text><Text style={styles.hint}>Les catégories attribuées à un autre budget sont indisponibles.</Text><ScrollView style={styles.categories}>{categories.map((category) => { const selected = draft.categoryIds.includes(category.id); const unavailable = assignedToOtherBudget(category.id); return <TouchableOpacity key={category.id} disabled={unavailable} onPress={() => toggleCategory(category.id)} style={[styles.category, selected && styles.categorySelected, unavailable && styles.categoryUnavailable]}><Text>{category.icon} {category.label}</Text><Text style={styles.categoryStatus}>{selected ? "Sélectionnée" : unavailable ? "Déjà attribuée" : ""}</Text></TouchableOpacity>; })}</ScrollView><View style={common.modalButtons}><TouchableOpacity style={common.btnConfirm} onPress={() => setModalVisible(false)}><Text style={common.btnConfirmText}>Annuler</Text></TouchableOpacity><TouchableOpacity style={styles.save} onPress={save}><Text style={styles.saveText}>{editingBudget ? "Modifier le budget" : "Créer le budget"}</Text></TouchableOpacity></View></View></View></Modal>
    <ConfirmModal visible={Boolean(budgetToDelete)} title="Supprimer le budget" message={`Supprimer « ${budgetToDelete?.name ?? ""} » ? Les dépenses ne seront pas supprimées.`} confirmText="Supprimer le budget" isDestructive onConfirm={remove} onCancel={() => setBudgetToDelete(null)} />
  </View>;
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background }, restricted: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.xl, gap: spacing.sm }, restrictedTitle: typography.h2, content: { padding: spacing.lg, gap: spacing.md }, hero: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingBottom: spacing.sm }, title: typography.h1, subtitle: typography.bodySm, addButton: { backgroundColor: "#0f766e", borderRadius: radius.md, padding: 10, flexDirection: "row", gap: 5, alignItems: "center" }, addText: { color: "#fff", fontWeight: "700" }, periodSelector: { gap: spacing.sm, paddingBottom: spacing.xs }, periodButton: { borderWidth: 1, borderColor: "#99f6e4", borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 7 }, periodButtonActive: { backgroundColor: "#0f766e", borderColor: "#0f766e" }, periodText: { color: "#115e59", fontSize: 12, fontWeight: "700" }, periodTextActive: { color: "#fff" }, loader: { marginTop: 44 }, info: { backgroundColor: "#ccfbf1", padding: spacing.md, borderRadius: radius.md }, infoText: { color: "#115e59", fontSize: 13 }, empty: { backgroundColor: colors.surface, alignItems: "center", gap: spacing.sm, padding: 34, borderRadius: radius.lg }, emptyTitle: typography.h3, emptyText: { ...typography.bodyMd, textAlign: "center" }, retry: { color: colors.primary, fontWeight: "700", marginTop: 6 }, card: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, gap: spacing.sm, borderLeftWidth: 4, borderLeftColor: "#0f766e", ...shadows.sm }, cardExceeded: { borderLeftColor: colors.danger, backgroundColor: "#fffafa" }, cardHeader: { flexDirection: "row", alignItems: "flex-start" }, cardTitle: typography.h3, categoryText: { ...typography.caption, marginTop: 3 }, iconButton: { padding: 7 }, remaining: { fontSize: 17, fontWeight: "800", color: "#0f766e" }, remainingExceeded: { color: colors.danger }, track: { height: 8, backgroundColor: "#ccfbf1", borderRadius: radius.full, overflow: "hidden" }, bar: { height: "100%", backgroundColor: "#0f766e" }, barExceeded: { backgroundColor: colors.danger }, amounts: { flexDirection: "row", justifyContent: "space-between", gap: 8 }, amountLabel: { fontSize: 12, color: colors.textSecondary }, amountValue: { fontWeight: "700", color: colors.textPrimary }, exceeded: { color: colors.danger, fontWeight: "700", fontSize: 13 }, incomplete: { color: colors.warningText, fontSize: 13, lineHeight: 19 }, overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,.35)" }, modal: { maxHeight: "88%", backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.xl }, modalTitle: { ...typography.h2, marginBottom: spacing.lg }, label: { ...typography.label, marginTop: spacing.sm, marginBottom: 5 }, hint: { ...typography.caption, marginBottom: 7 }, input: { borderWidth: 1, borderColor: colors.neutral200, borderRadius: radius.sm, padding: 11, fontSize: 16 }, categories: { maxHeight: 220, borderWidth: 1, borderColor: colors.neutral200, borderRadius: radius.sm }, category: { minHeight: 44, paddingHorizontal: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: colors.neutral100 }, categorySelected: { backgroundColor: "#ccfbf1" }, categoryUnavailable: { opacity: .45 }, categoryStatus: { fontSize: 12, color: "#115e59" }, save: { flex: 2, backgroundColor: "#0f766e", padding: spacing.md + 3, marginTop: spacing.xl, borderRadius: radius.lg, alignItems: "center" }, saveText: { color: "#fff", fontWeight: "700" },
});

export default BudgetsScreen;
