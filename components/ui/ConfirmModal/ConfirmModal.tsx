import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { ConfirmModalProps } from "./ConfirmModal.type";
import { styles } from "../../../styles/components/ui/ConfirmModal/ConfirmModal.style";
import { common } from "styles/common.style";

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmer",
  isDestructive = false,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={[common.modalOverlay, common.modalCenteredOverlay]}>
          <TouchableWithoutFeedback>
            <View style={common.modalCenteredContainer}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={onCancel}>
                  <Text style={styles.cancelText}>Annuler</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    isDestructive && styles.destructiveButton,
                  ]}
                  onPress={onConfirm}
                >
                  <Text
                    style={[
                      styles.confirmText,
                      isDestructive && styles.destructiveText,
                    ]}
                  >
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
