import React, { useState, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { styles } from "styles/screens/ChargesFixesScreen/PeriodiciteFormSection/PeriodiciteFormSection.style";
import { common } from "styles/common.style";
import {
  IEcheancierEntry,
  IJourNommeConfig,
  IChargeFixeTemplate,
  PeriodiciteType,
} from "@/types";
import { DayPickerModal } from "components/ui/DayPickerModal/DayPickerModal";
import { PeriodicityPickerModal } from "./PeriodicityPickerModal/PeriodicityPickerModal";
import { UniversalDatePicker } from "components/ui/UniversalDatePicker/UniversalDatePicker";
import {
  CalendarDays,
  ChevronsUpDown,
  Plus,
  Trash2,
} from "lucide-react-native";
import dayjs from "dayjs";

export interface PeriodiciteValue {
  periodiciteType: PeriodiciteType;
  periodiciteIntervalle: number;
  datePremierPrelevement: string | null;
  dateFin: string | null;
  echeancier: IEcheancierEntry[] | null;
  jourNommeConfig: IJourNommeConfig | null;
}

export interface PeriodiciteFormSectionProps {
  value: PeriodiciteValue;
  onChange: (v: PeriodiciteValue) => void;
  disabled?: boolean;
  montantDefault?: number;
}

export const DEFAULT_PERIODICITE_VALUE: PeriodiciteValue = {
  periodiciteType: "mensuel",
  periodiciteIntervalle: 1,
  datePremierPrelevement: null,
  dateFin: null,
  echeancier: null,
  jourNommeConfig: { position: 1, dayOfWeek: 1 },
};

const PERIODICITE_META: Record<
  PeriodiciteType,
  { label: string; icon: string }
> = {
  mensuel: { label: "Mensuel", icon: "🔁" },
  annuel: { label: "Annuel", icon: "🗓️" },
  hebdomadaire: { label: "Hebdomadaire", icon: "📆" },
  journalier: { label: "Journalier", icon: "☀️" },
  jour_nomme: { label: "Jour nommé", icon: "📌" },
  echeancier: { label: "Échéancier libre", icon: "📋" },
};

const POSITIONS: { value: 1 | 2 | 3 | 4 | -1; label: string }[] = [
  { value: 1, label: "1er" },
  { value: 2, label: "2ème" },
  { value: 3, label: "3ème" },
  { value: 4, label: "4ème" },
  { value: -1, label: "Dernier" },
];

const DAYS_WEEK: { value: 0 | 1 | 2 | 3 | 4 | 5 | 6; label: string }[] = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mer" },
  { value: 4, label: "Jeu" },
  { value: 5, label: "Ven" },
  { value: 6, label: "Sam" },
  { value: 0, label: "Dim" },
];

const MONTHS_FR = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Jun",
  "Jul",
  "Aoû",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];

export function extractPeriodiciteValue(
  charge: IChargeFixeTemplate,
): PeriodiciteValue {
  return {
    periodiciteType: charge.periodiciteType ?? "mensuel",
    periodiciteIntervalle: charge.periodiciteIntervalle ?? 1,
    datePremierPrelevement: charge.datePremierPrelevement ?? null,
    dateFin: charge.dateFin ?? null,
    echeancier: charge.echeancier ?? null,
    jourNommeConfig: charge.jourNommeConfig ?? { position: 1, dayOfWeek: 1 },
  };
}

export function validatePeriodicite(v: PeriodiciteValue): string | null {
  switch (v.periodiciteType) {
    case "mensuel":
    case "annuel":
      if (!v.datePremierPrelevement)
        return "Veuillez choisir une date anniversaire";
      return null;
    case "hebdomadaire":
    case "journalier":
      if (!v.datePremierPrelevement || !dayjs(v.datePremierPrelevement).isValid())
        return "Veuillez choisir une date de premier prélèvement";
      return null;
    case "jour_nomme":
      if (!v.jourNommeConfig) return "Veuillez configurer le jour nommé";
      return null;
    case "echeancier":
      if (!v.echeancier || v.echeancier.length === 0)
        return "Veuillez ajouter au moins une échéance";
      if (v.echeancier.some((e) => !dayjs(e.date).isValid() || e.montant <= 0))
        return "Certaines échéances ont une date ou un montant invalide";
      return null;
    default:
      return null;
  }
}

function dayToAnchorDate(day: number, month?: number): string {
  const today = dayjs();
  if (month !== undefined) {
    const candidate = dayjs().month(month).date(day);
    return today.isBefore(candidate, "day") || today.isSame(candidate, "day")
      ? candidate.format("YYYY-MM-DD")
      : candidate.add(1, "year").format("YYYY-MM-DD");
  }
  const candidate = today.date(day);
  return today.date() <= day
    ? candidate.format("YYYY-MM-DD")
    : candidate.add(1, "month").format("YYYY-MM-DD");
}

function toDate(iso: string | null): Date {
  return iso && dayjs(iso).isValid() ? dayjs(iso).toDate() : new Date();
}

function toISO(date: Date): string {
  return dayjs(date).format("YYYY-MM-DD");
}

const PICKER_STYLES = {
  selectorContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginTop: 2,
  },
  miniUserText: {
    fontSize: 15,
    color: "#2c3e50",
    fontWeight: "500" as const,
  },
};

const Stepper: React.FC<{
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}> = ({ value, onChange, min = 1, max = 99, disabled }) => (
  <View style={styles.stepper}>
    <TouchableOpacity
      style={[
        styles.stepBtn,
        (disabled || value <= min) && styles.stepBtnDisabled,
      ]}
      onPress={() => onChange(Math.max(min, value - 1))}
      disabled={disabled || value <= min}
    >
      <Text style={styles.stepBtnText}>−</Text>
    </TouchableOpacity>
    <Text style={styles.stepValue}>{value}</Text>
    <TouchableOpacity
      style={[
        styles.stepBtn,
        (disabled || value >= max) && styles.stepBtnDisabled,
      ]}
      onPress={() => onChange(Math.min(max, value + 1))}
      disabled={disabled || value >= max}
    >
      <Text style={styles.stepBtnText}>+</Text>
    </TouchableOpacity>
  </View>
);

function Chip({
  selected,
  label,
  onPress,
  disabled,
}: {
  selected: boolean;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        selected && styles.chipSelected,
        disabled && styles.chipDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export const PeriodiciteFormSection: React.FC<PeriodiciteFormSectionProps> = ({
  value,
  onChange,
  disabled,
  montantDefault = 0,
}) => {
  type DayTarget = "anchor" | "bi_1" | "bi_2" | null;
  const [dayModalTarget, setDayModalTarget] = useState<DayTarget>(null);
  const [isTypeModalVisible, setIsTypeModalVisible] = useState(false);
  const [showDateFin, setShowDateFin] = useState(!!value.dateFin);
  // "anchor" | "dateFin" | number (index écheancier) | null
  type PickerTarget = "anchor" | "dateFin" | number | null;
  const [visiblePicker, setVisiblePicker] = useState<PickerTarget>(null);

  const set = useCallback(
    (patch: Partial<PeriodiciteValue>) => onChange({ ...value, ...patch }),
    [value, onChange],
  );

  const anchorDay = value.datePremierPrelevement
    ? dayjs(value.datePremierPrelevement).date()
    : 1;
  const anchorMonth = value.datePremierPrelevement
    ? dayjs(value.datePremierPrelevement).month()
    : 0;
  const jn: IJourNommeConfig = value.jourNommeConfig ?? {
    position: 1,
    dayOfWeek: 1,
  };
  const meta = PERIODICITE_META[value.periodiciteType];

  const IntervalBlock = ({ unit }: { unit: string }) => (
    <View style={styles.stepperContainer}>
      <Text style={common.inputLabel}>Fréquence</Text>
      <View style={styles.stepperRow}>
        <Text style={styles.stepperLabel}>Tous les</Text>
        <Stepper
          value={value.periodiciteIntervalle}
          onChange={(n) => set({ periodiciteIntervalle: n })}
          disabled={disabled}
        />
        <Text style={styles.stepperLabel}>{unit}</Text>
      </View>
    </View>
  );

  const DayPickerButton = ({
    label,
    day,
    target,
  }: {
    label: string;
    day: number;
    target: DayTarget;
  }) => (
    <View>
      <Text style={common.inputLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.dayPickerButton}
        onPress={() => setDayModalTarget(target)}
        disabled={disabled}
      >
        <View style={styles.dayPickerLeft}>
          <CalendarDays size={16} color="#666" />
          <Text style={styles.dayPickerText}>Le {day} du mois</Text>
        </View>
        <ChevronsUpDown size={14} color="#8E8E93" />
      </TouchableOpacity>
    </View>
  );

  const DateInput = ({ label }: { label: string }) => (
    <View style={styles.dateInputContainer}>
      <Text style={common.inputLabel}>{label}</Text>
      <UniversalDatePicker
        date={toDate(value.datePremierPrelevement)}
        label={value.datePremierPrelevement
          ? dayjs(value.datePremierPrelevement).format("DD/MM/YYYY")
          : "Choisir une date"}
        isVisible={visiblePicker === "anchor"}
        onOpen={() => setVisiblePicker("anchor")}
        onConfirm={(date: Date) => {
          set({ datePremierPrelevement: toISO(date) });
          setVisiblePicker(null);
        }}
        onCancel={() => setVisiblePicker(null)}
        styles={PICKER_STYLES}
        containerStyle={{ marginBottom: 0 }}
      />
    </View>
  );

  const renderTypeFields = () => {
    switch (value.periodiciteType) {
      case "mensuel":
        return (
          <>
            <IntervalBlock unit="mois" />
            <DayPickerButton
              label="Jour de prélèvement"
              day={anchorDay}
              target="anchor"
            />
          </>
        );

      case "annuel":
        return (
          <>
            <IntervalBlock unit="ans" />
            <DayPickerButton
              label="Jour du prélèvement"
              day={anchorDay}
              target="anchor"
            />
            <View>
              <Text style={common.inputLabel}>Mois</Text>
              <View style={styles.chipGroup}>
                {MONTHS_FR.map((m, i) => (
                  <Chip
                    key={i}
                    label={m}
                    selected={anchorMonth === i}
                    onPress={() =>
                      set({
                        datePremierPrelevement: dayToAnchorDate(anchorDay, i),
                      })
                    }
                    disabled={disabled}
                  />
                ))}
              </View>
            </View>
          </>
        );

      case "hebdomadaire":
        return (
          <>
            <IntervalBlock unit="semaines" />
            <DateInput label="Date du premier prélèvement" />
          </>
        );

      case "journalier":
        return (
          <>
            <IntervalBlock unit="jours" />
            <DateInput label="Date du premier prélèvement" />
          </>
        );

      case "jour_nomme":
        return (
          <>
            <View>
              <Text style={common.inputLabel}>Position dans le mois</Text>
              <View style={styles.chipGroup}>
                {POSITIONS.map((p) => (
                  <Chip
                    key={p.value}
                    label={p.label}
                    selected={jn.position === p.value}
                    onPress={() =>
                      set({ jourNommeConfig: { ...jn, position: p.value } })
                    }
                    disabled={disabled}
                  />
                ))}
              </View>
            </View>
            <View>
              <Text style={common.inputLabel}>Jour de la semaine</Text>
              <View style={styles.chipGroup}>
                {DAYS_WEEK.map((d) => (
                  <Chip
                    key={d.value}
                    label={d.label}
                    selected={jn.dayOfWeek === d.value}
                    onPress={() =>
                      set({ jourNommeConfig: { ...jn, dayOfWeek: d.value } })
                    }
                    disabled={disabled}
                  />
                ))}
              </View>
            </View>
          </>
        );

      case "echeancier":
        return (
          <View style={styles.echeancierContainer}>
            <Text style={common.inputLabel}>
              Échéances{" "}
              <Text style={{ color: "#95a5a6", fontWeight: "400" }}>
                (date · montant)
              </Text>
            </Text>
            {(value.echeancier ?? []).map((entry, idx) => (
              <View key={idx} style={styles.echeRow}>
                <UniversalDatePicker
                  date={toDate(entry.date)}
                  label={dayjs(entry.date).isValid()
                    ? dayjs(entry.date).format("DD/MM/YYYY")
                    : "Choisir une date"}
                  isVisible={visiblePicker === idx}
                  onOpen={() => setVisiblePicker(idx)}
                  onConfirm={(date: Date) => {
                    const updated = [...(value.echeancier ?? [])];
                    updated[idx] = { ...entry, date: toISO(date) };
                    set({ echeancier: updated });
                    setVisiblePicker(null);
                  }}
                  onCancel={() => setVisiblePicker(null)}
                  styles={PICKER_STYLES}
                  containerStyle={{
                    flex: 1,
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                    marginBottom: 0,
                  }}
                />
                <TextInput
                  style={styles.echeInputMontant}
                  value={entry.montant > 0 ? entry.montant.toString() : ""}
                  onChangeText={(t) => {
                    const updated = [...(value.echeancier ?? [])];
                    updated[idx] = {
                      ...entry,
                      montant: parseFloat(t.replace(",", ".")) || 0,
                    };
                    set({ echeancier: updated });
                  }}
                  placeholder="0.00 €"
                  placeholderTextColor="#95a5a6"
                  keyboardType="decimal-pad"
                  {...({ inputMode: "decimal" } as any)}
                  maxLength={9}
                  editable={!disabled}
                />
                <TouchableOpacity
                  style={styles.echeDeleteBtn}
                  hitSlop={8}
                  onPress={() => {
                    const updated = (value.echeancier ?? []).filter(
                      (_, i) => i !== idx,
                    );
                    set({ echeancier: updated });
                  }}
                  disabled={disabled}
                >
                  <Trash2 size={18} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={styles.echeAddButton}
              onPress={() => {
                const newEntry: IEcheancierEntry = {
                  date: dayjs().format("YYYY-MM-DD"),
                  montant: montantDefault,
                };
                set({ echeancier: [...(value.echeancier ?? []), newEntry] });
              }}
              disabled={disabled}
            >
              <Plus size={15} color="#3498db" />
              <Text style={styles.echeAddText}>Ajouter une échéance</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };


  return (
    <View>
      <Text style={common.inputLabel}>Périodicité</Text>
      <TouchableOpacity
        style={styles.typeSelector}
        onPress={() => setIsTypeModalVisible(true)}
        disabled={disabled}
      >
        <View style={styles.typeSelectorLeft}>
          <Text style={styles.typeSelectorIcon}>{meta.icon}</Text>
          <Text style={styles.typeSelectorValue}>{meta.label}</Text>
        </View>
        <ChevronsUpDown size={14} color="#8E8E93" />
      </TouchableOpacity>

      {renderTypeFields()}

      <View style={styles.sectionDivider} />

      <View style={styles.dateFinRow}>
        <View style={styles.dateFinLabelWrapper}>
          <CalendarDays size={14} color="#888" />
          <Text style={common.inputLabel}>Date de fin</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.dateFinToggle,
            showDateFin && styles.dateFinToggleActive,
          ]}
          onPress={() => {
            const next = !showDateFin;
            setShowDateFin(next);
            if (!next) set({ dateFin: null });
          }}
          disabled={disabled}
        >
          <Text
            style={[
              styles.dateFinToggleText,
              showDateFin && styles.dateFinToggleTextActive,
            ]}
          >
            {showDateFin ? "Activée ✓" : "Optionnel"}
          </Text>
        </TouchableOpacity>
      </View>
      {showDateFin && (
        <UniversalDatePicker
          date={toDate(value.dateFin)}
          label={value.dateFin
            ? dayjs(value.dateFin).format("DD/MM/YYYY")
            : "Choisir une date de fin"}
          isVisible={visiblePicker === "dateFin"}
          onOpen={() => setVisiblePicker("dateFin")}
          onConfirm={(date: Date) => {
            set({ dateFin: toISO(date) });
            setVisiblePicker(null);
          }}
          onCancel={() => setVisiblePicker(null)}
          styles={PICKER_STYLES}
          containerStyle={{ marginTop: 4 }}
        />
      )}

      <DayPickerModal
        isVisible={dayModalTarget === "anchor"}
        onClose={() => setDayModalTarget(null)}
        selectedDay={anchorDay}
        onSelectDay={(day) => {
          const anchor =
            value.periodiciteType === "annuel"
              ? dayToAnchorDate(day, anchorMonth)
              : dayToAnchorDate(day);
          set({ datePremierPrelevement: anchor });
          setDayModalTarget(null);
        }}
      />

      <PeriodicityPickerModal
        isVisible={isTypeModalVisible}
        onClose={() => setIsTypeModalVisible(false)}
        selectedId={value.periodiciteType}
        onSelect={(type) => {
          set({ periodiciteType: type, periodiciteIntervalle: 1 });
        }}
      />
    </View>
  );
};