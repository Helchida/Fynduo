import { View, Text } from "react-native";
import { styles } from "./NoAuthenticatedUser.style";

const NoAuthenticatedUser: React.FC = () => {
return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Utilisateur non authentifié.</Text>
      </View>
    );
}

export default NoAuthenticatedUser;