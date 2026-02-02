import { View, Text } from "react-native";
import { BadgeChargeProps } from "./BadgeCharge.type";
import { styles } from "./BadgeCharge.style";

const BadgeCharge: React.FC<BadgeChargeProps> = ({
  chargeScope,
  chargeType,
}) => {
  const isFromSharedHousehold = chargeScope === "partage";
  const isFixedCharge = chargeType === "fixe";

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          isFixedCharge ? styles.fixedBadge : styles.variableBadge,
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            isFixedCharge ? styles.fixedBadgeText : styles.variableBadgeText,
          ]}
        >
          {isFixedCharge ? "Fixe" : "Variable"}
        </Text>
      </View>

      <View
        style={[
          styles.badge,
          isFromSharedHousehold ? styles.sharedBadge : styles.soloBadge,
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            isFromSharedHousehold
              ? styles.sharedBadgeText
              : styles.soloBadgeText,
          ]}
        >
          {isFromSharedHousehold ? "Partagé" : "Solo"}
        </Text>
      </View>
    </View>
  );
};

export default BadgeCharge;
