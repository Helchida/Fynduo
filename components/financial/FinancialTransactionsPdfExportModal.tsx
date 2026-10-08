import React, { useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import dayjs from "dayjs";
import { ICharge, IRevenu } from "@/types";
import { UniversalDatePicker } from "components/ui/UniversalDatePicker/UniversalDatePicker";
import { useToast } from "hooks/useToast";
import { buildFinancialExport, validateExportRange } from "utils/financialExport";
import { downloadFinancialTransactionsPdf } from "utils/financialPdf";
import { downloadFinancialTransactionsCsv } from "utils/financialCsv";

type Props = {
  visible: boolean;
  onClose: () => void;
  revenus: IRevenu[];
  charges: ICharge[];
  revenueCategoryLabel: (id: string) => string;
  chargeCategoryLabel: (id: string) => string;
  householdId: string;
  currentUserId?: string;
  payerName: (id: string) => string;
};

const pickerStyles = {
  selectorContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  miniUserText: { fontSize: 15, color: "#1A1A1A" },
};

export const FinancialTransactionsPdfExportModal: React.FC<Props> = ({
  visible,
  onClose,
  revenus,
  charges,
  revenueCategoryLabel,
  chargeCategoryLabel,
  householdId,
  currentUserId,
  payerName,
}) => {
  const toast = useToast();
  const [rangeMode, setRangeMode] = useState<"all" | "range">("all");
  const [format, setFormat] = useState<"pdf" | "csv">("pdf");
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [startPickerVisible, setStartPickerVisible] = useState(false);
  const [endPickerVisible, setEndPickerVisible] = useState(false);

  const exportTransactions = () => {
    if (rangeMode === "range") {
      const error = validateExportRange(start, end);
      if (error) return toast.error("Plage invalide", error);
    }
    const data = buildFinancialExport({
      revenus,
      charges,
      revenueCategoryLabel,
      chargeCategoryLabel,
      householdId,
      currentUserId,
      payerName,
      start: rangeMode === "range" ? start : undefined,
      end: rangeMode === "range" ? end : undefined,
    });
    if (data.transactions.length === 0) {
      return toast.info("Aucune transaction", "Aucune transaction ne correspond à cette sélection.");
    }
    if (format === "pdf") {
      downloadFinancialTransactionsPdf({
        ...data,
        titlePeriod: rangeMode === "all"
          ? "Toutes les transactions"
          : `${dayjs(start).format("DD/MM/YYYY")} → ${dayjs(end).format("DD/MM/YYYY")}`,
      });
    } else {
      downloadFinancialTransactionsCsv(data.transactions);
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 20 }}>
        <Pressable onPress={(event) => event.stopPropagation()} style={{ backgroundColor: "white", borderRadius: 18, padding: 20, maxWidth: 520, width: "100%", alignSelf: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#1A1A1A" }}>Exporter les transactions</Text>
          <Text style={{ marginTop: 6, marginBottom: 18, color: "#5D6670" }}>Revenus et dépenses du foyer sélectionné</Text>

          <TouchableOpacity onPress={() => setRangeMode("all")} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}>
            <Text style={{ fontSize: 20, color: "#007AFF", marginRight: 10 }}>{rangeMode === "all" ? "◉" : "○"}</Text>
            <Text style={{ fontSize: 16 }}>Toutes les transactions</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setRangeMode("range")} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}>
            <Text style={{ fontSize: 20, color: "#007AFF", marginRight: 10 }}>{rangeMode === "range" ? "◉" : "○"}</Text>
            <Text style={{ fontSize: 16 }}>Entre deux dates</Text>
          </TouchableOpacity>

          {rangeMode === "range" && (
            <View style={{ marginTop: 8, gap: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#1A1A1A" }}>Période personnalisée</Text>
              <UniversalDatePicker date={start} label="Du" isVisible={startPickerVisible} onOpen={() => setStartPickerVisible(true)} onConfirm={setStart} onCancel={() => setStartPickerVisible(false)} styles={pickerStyles} />
              <UniversalDatePicker date={end} label="Au" isVisible={endPickerVisible} onOpen={() => setEndPickerVisible(true)} onConfirm={setEnd} onCancel={() => setEndPickerVisible(false)} styles={pickerStyles} />
            </View>
          )}

          <Text style={{ marginTop: 18, fontSize: 16, fontWeight: "700", color: "#1A1A1A" }}>Format</Text>
          {(["pdf", "csv"] as const).map((exportFormat) => (
            <TouchableOpacity key={exportFormat} onPress={() => setFormat(exportFormat)} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}>
              <Text style={{ fontSize: 20, color: "#007AFF", marginRight: 10 }}>{format === exportFormat ? "◉" : "○"}</Text>
              <Text style={{ fontSize: 16 }}>{exportFormat.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}

          <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 22 }}>
            <TouchableOpacity onPress={onClose} style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
              <Text style={{ color: "#5D6670", fontWeight: "600" }}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={exportTransactions} style={{ paddingVertical: 12, paddingHorizontal: 16, backgroundColor: "#007AFF", borderRadius: 10 }}>
              <Text style={{ color: "white", fontWeight: "700" }}>Exporter en {format.toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
