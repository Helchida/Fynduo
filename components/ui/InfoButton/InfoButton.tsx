import React from "react";
import { TouchableOpacity } from "react-native";
import { Info } from "lucide-react-native";
import { styles } from "../../../styles/components/ui/InfoButton/InfoButton.style";

interface InfoButtonProps {
  onPress: () => void;
}

export const InfoButton: React.FC<InfoButtonProps> = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.button} hitSlop={8}>
    <Info size={22} color="#2c3e50" />
  </TouchableOpacity>
);

