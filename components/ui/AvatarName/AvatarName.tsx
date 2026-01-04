import { View, Text } from "react-native";
import { styles } from "./AvatarName.style";
import { AvatarNameProps } from "./AvatarName.type";
import { User } from "lucide-react-native";

const AvatarName: React.FC<AvatarNameProps> = ({ name }) => {
  const hasName = name && name.trim().length > 0;
  const initialName = hasName ? name.trim().charAt(0).toUpperCase() : null;
  return (
    <View style={styles.avatarPlaceholder}>
      {hasName ? (
        <Text style={styles.avatarText}>{initialName}</Text>
      ) : (
        <User color="#fff" size={24} strokeWidth={2.5} />
      )}
    </View>
  );
};

export default AvatarName;
