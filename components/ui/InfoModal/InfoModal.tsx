import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { styles } from "../../../styles/components/ui/InfoModal/InfoModal.style";

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeLabel?: string;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  visible,
  onClose,
  children,
  closeLabel = "Compris !",
}) => (
  <Modal
    visible={visible}
    animationType="fade"
    transparent={true}
    onRequestClose={onClose}
  >
    <View style={styles.overlay}>
      <View style={styles.content}>
        {children}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>{closeLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

