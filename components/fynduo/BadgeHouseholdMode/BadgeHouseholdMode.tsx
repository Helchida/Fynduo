import { View, Text } from "react-native";
import { BadgeHouseholdModeProps } from "./BadgeHouseholdMode.type";
import { styles } from "./BadgeHouseholdMode.style";

const BadgeHouseholdMode: React.FC<BadgeHouseholdModeProps> = ({
  isFromSharedHousehold,
}) => {
  return (
    <View
      style={[
        styles.badge,
        isFromSharedHousehold ? styles.sharedBadge : styles.soloBadge,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          isFromSharedHousehold ? styles.sharedBadgeText : styles.soloBadgeText,
        ]}
      >
        {isFromSharedHousehold ? "Partagé" : "Solo"}
      </Text>
    </View>
  );
};

export default BadgeHouseholdMode;
