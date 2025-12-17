import { View, Text } from "react-native";
import { styles } from "./AvatarName.style";
import { AvatarNameProps } from "./AvatarName.type";

const AvatarName: React.FC<AvatarNameProps> = ({name}) => {
    const initialName = name.charAt(0).toUpperCase();
    return (
        <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{initialName}</Text>
        </View>
    );
}

export default AvatarName;