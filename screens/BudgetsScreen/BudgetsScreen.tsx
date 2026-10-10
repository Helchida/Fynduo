import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import dayjs from "dayjs";
import { Pencil, PlusCircle, ReceiptText, Trash2, WalletCards } from "lucide-react-native";
import { useAuth } from "hooks/useAuth";
import { useCategories } from "hooks/useCategories";
import { useComptes } from "hooks/useComptes";
import { useToast } from "hooks/useToast";
import { ConfirmModal } from "components/ui/ConfirmModal/ConfirmModal";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { IBudget } from "@/types";
import * as DB from "services/supabase/db";
import { formatCents, getBudgetTotals, parseEuroToCents } from "utils/budgets";
import { FinancialPeriod } from "utils/financialPeriods";
import { colors, radius, shadows, spacing, typography } from "styles/theme.style";

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
  const { categories, isLoadingCategories } = useCategories();
  const { charges, financialPeriods } = useComptes();
  const toast = useToast();
  const [budgets, setBudgets] = useState<IBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState<IBudget | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [budgetToDelete, setBudgetToDelete] = useState<IBudget | null>(null);
  const isSolo = user?.activeHouseholdId === user?.id;
  const currentPeriod = useMemo(
    () => (isSolo && financialPeriods.length ? financialPeriods[financialPeriods.length - 1] : calendarPeriod()),
    [financialPeriods, isSolo],
  );
  const periodKey = isSolo && financialPeriods.length ? `pay:${currentPeriod.id}` : `calendar:${dayjs().format("YYYY-MM")}`;

  const refresh = useCallback(async () => {
    if (!user?.activeHouseholdId) return;
    try {
      setLoading(true);
      setError(null);
      const result = await DB.getBudgets(user.activeHouseholdId);
      setBudgets(result);
    } catch (cause) {
      setError("Impossible de charger les budgets.");
      console.error("getBudgets", cause);
    } finally {
      setLoading(false);
    }
  }, [user?.activeHouseholdId]);

  useEffect(() => { refresh(); }, [refresh]);

  if (!user) return <NoAuthenticatedUser />;

  const openCreate = () => {
    setEditingBudget(null);
    setDraft(emptyDraft);
    setModalVisible(true);
  };
  const openEdit = (budget: IBudget) => {
    setEditingBudget(budget);
    setDraft({ name: budget.name, amount: (budget.initialAmountCents / 100).toFixed(2), categoryIds: budget.categoryIds });
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
    const cents = parseEuroToCents(draft.amount);
    if (!draft.name.trim()) return toast.error("Nom requis", "Indiquez un nom pour le budget.");
    if (cents === null) return toast.error("Montant invalide", "Le montant initial doit être positif ou nul.");
    if (!draft.categoryIds.length) return toast.error("Catégorie requise", "Sélectionnez au moins une catégorie.");
    const duplicate = draft.categoryIds.find(assignedToOtherBudget);
    if (duplicate) return toast.error("Catégorie déjà attribuée", "Cette catégorie appartient déjà à un autre budget de ce foyer.");
    const budget: Omit<IBudget, "householdId"> = {
      id: editingBudget?.id ?? `budget_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      name: draft.name.trim(), initialAmountCents: cents, categoryIds: draft.categoryIds,
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
      await DB.deleteBudget(user.activeHouseholdId, budgetToDelete.id);
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
        <WalletCards color="#7c3aed" size={28} />
        <View style={{ flex: 1 }}><Text style={styles.title}>Budgets</Text><Text style={styles.subtitle}>Suivi de {currentPeriod.label}</Text></View>
        <TouchableOpacity accessibilityLabel="Créer un budget" style={styles.addButton} onPress={openCreate}><PlusCircle color="#fff" size={19} /><Text style={styles.addText}>Créer</Text></TouchableOpacity>
      </View>
      {isSolo && !financialPeriods.length && <View style={styles.info}><Text style={styles.infoText}>Aucune période de paie active : les budgets suivent le mois civil jusqu’à la prochaine paie de référence.</Text></View>}
      {loading || isLoadingCategories ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : error ? <View style={styles.empty}><Text>{error}</Text><TouchableOpacity onPress={refresh}><Text style={styles.retry}>Réessayer</Text></TouchableOpacity></View> : budgets.length === 0 ? <View style={styles.empty}><ReceiptText color="#a78bfa" size={36} /><Text style={styles.emptyTitle}>Aucun budget</Text><Text style={styles.emptyText}>Créez un budget pour suivre vos dépenses par catégorie.</Text></View> : budgets.map((budget) => {
        const totals = getBudgetTotals(budget.initialAmountCents, budget.categoryIds, charges, currentPeriod, { isSoloMode: isSolo, currentUserId: user.id });
        const exceeded = totals.remainingAmountCents < 0;
        const progress = totals.initialAmountCents === 0 ? (totals.spentAmountCents ? 100 : 0) : Math.min(100, (totals.spentAmountCents / totals.initialAmountCents) * 100);
        return <View key={budget.id} style={[styles.card, exceeded && styles.cardExceeded]}>
          <View style={styles.cardHeader}><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{budget.name}</Text><Text style={styles.categoryText}>{budget.categoryIds.map((id) => categories.find((category) => category.id === id)?.label ?? "Catégorie supprimée").join(" · ")}</Text></View><TouchableOpacity onPress={() => openEdit(budget)} style={styles.iconButton}><Pencil color={colors.primary} size={18} /></TouchableOpacity><TouchableOpacity onPress={() => setBudgetToDelete(budget)} style={styles.iconButton}><Trash2 color={colors.danger} size={18} /></TouchableOpacity></View>
          <Text style={[styles.remaining, exceeded && styles.remainingExceeded]}>Montant restant : {formatCents(totals.remainingAmountCents)} sur {formatCents(totals.initialAmountCents)}</Text>
          <View style={styles.track}><View style={[styles.bar, { width: `${progress}%` }, exceeded && styles.barExceeded]} /></View>
          <View style={styles.amounts}><Text style={styles.amountLabel}>Dépensé <Text style={styles.amountValue}>{formatCents(totals.spentAmountCents)}</Text></Text><Text style={styles.amountLabel}>Montant initial <Text style={styles.amountValue}>{formatCents(totals.initialAmountCents)}</Text></Text></View>
          {exceeded && <Text style={styles.exceeded}>Budget dépassé de {formatCents(Math.abs(totals.remainingAmountCents))}.</Text>}
        </View>;
      })}
    </ScrollView>
    <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}><View style={styles.overlay}><View style={styles.modal}><Text style={styles.modalTitle}>{editingBudget ? "Modifier le budget" : "Créer un budget"}</Text><Text style={styles.label}>Nom</Text><TextInput style={styles.input} value={draft.name} onChangeText={(name) => setDraft((value) => ({ ...value, name }))} placeholder="ex : Courses" /><Text style={styles.label}>Montant initial (€)</Text><TextInput style={styles.input} keyboardType="decimal-pad" value={draft.amount} onChangeText={(amount) => setDraft((value) => ({ ...value, amount }))} placeholder="ex : 150" /><Text style={styles.label}>Catégories associées</Text><Text style={styles.hint}>Les catégories attribuées à un autre budget sont indisponibles.</Text><ScrollView style={styles.categories}>{categories.map((category) => { const selected = draft.categoryIds.includes(category.id); const unavailable = assignedToOtherBudget(category.id); return <TouchableOpacity key={category.id} disabled={unavailable} onPress={() => toggleCategory(category.id)} style={[styles.category, selected && styles.categorySelected, unavailable && styles.categoryUnavailable]}><Text>{category.icon} {category.label}</Text><Text style={styles.categoryStatus}>{selected ? "Sélectionnée" : unavailable ? "Déjà attribuée" : ""}</Text></TouchableOpacity>; })}</ScrollView><View style={styles.actions}><TouchableOpacity style={styles.cancel} onPress={() => setModalVisible(false)}><Text>Annuler</Text></TouchableOpacity><TouchableOpacity style={styles.save} onPress={save}><Text style={styles.saveText}>{editingBudget ? "Modifier le budget" : "Créer un budget"}</Text></TouchableOpacity></View></View></View></Modal>
    <ConfirmModal visible={Boolean(budgetToDelete)} title="Supprimer le budget" message={`Supprimer « ${budgetToDelete?.name ?? ""} » ? Les dépenses ne seront pas supprimées.`} confirmText="Supprimer le budget" isDestructive onConfirm={remove} onCancel={() => setBudgetToDelete(null)} />
  </View>;
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background }, content: { padding: spacing.lg, gap: spacing.md }, hero: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingBottom: spacing.sm }, title: typography.h1, subtitle: typography.bodySm, addButton: { backgroundColor: "#7c3aed", borderRadius: radius.md, padding: 10, flexDirection: "row", gap: 5, alignItems: "center" }, addText: { color: "#fff", fontWeight: "700" }, loader: { marginTop: 44 }, info: { backgroundColor: "#f3e8ff", padding: spacing.md, borderRadius: radius.md }, infoText: { color: "#6b21a8", fontSize: 13 }, empty: { backgroundColor: colors.surface, alignItems: "center", gap: spacing.sm, padding: 34, borderRadius: radius.lg }, emptyTitle: typography.h3, emptyText: { ...typography.bodyMd, textAlign: "center" }, retry: { color: colors.primary, fontWeight: "700", marginTop: 6 }, card: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, gap: spacing.sm, borderLeftWidth: 4, borderLeftColor: "#8b5cf6", ...shadows.sm }, cardExceeded: { borderLeftColor: colors.danger, backgroundColor: "#fffafa" }, cardHeader: { flexDirection: "row", alignItems: "flex-start" }, cardTitle: typography.h3, categoryText: { ...typography.caption, marginTop: 3 }, iconButton: { padding: 7 }, remaining: { fontSize: 17, fontWeight: "800", color: "#6d28d9" }, remainingExceeded: { color: colors.danger }, track: { height: 8, backgroundColor: "#ede9fe", borderRadius: radius.full, overflow: "hidden" }, bar: { height: "100%", backgroundColor: "#8b5cf6" }, barExceeded: { backgroundColor: colors.danger }, amounts: { flexDirection: "row", justifyContent: "space-between", gap: 8 }, amountLabel: { fontSize: 12, color: colors.textSecondary }, amountValue: { fontWeight: "700", color: colors.textPrimary }, exceeded: { color: colors.danger, fontWeight: "700", fontSize: 13 }, overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,.35)" }, modal: { maxHeight: "88%", backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.xl }, modalTitle: { ...typography.h2, marginBottom: spacing.lg }, label: { ...typography.label, marginTop: spacing.sm, marginBottom: 5 }, hint: { ...typography.caption, marginBottom: 7 }, input: { borderWidth: 1, borderColor: colors.neutral200, borderRadius: radius.sm, padding: 11, fontSize: 16 }, categories: { maxHeight: 220, borderWidth: 1, borderColor: colors.neutral200, borderRadius: radius.sm }, category: { minHeight: 44, paddingHorizontal: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: colors.neutral100 }, categorySelected: { backgroundColor: "#ede9fe" }, categoryUnavailable: { opacity: .45 }, categoryStatus: { fontSize: 12, color: "#6d28d9" }, actions: { flexDirection: "row", justifyContent: "flex-end", gap: spacing.sm, marginTop: spacing.lg }, cancel: { padding: 12 }, save: { backgroundColor: "#7c3aed", padding: 12, borderRadius: radius.sm }, saveText: { color: "#fff", fontWeight: "700" },
});

export default BudgetsScreen;
