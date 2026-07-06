import { View, Text } from "react-native";
import { BadgeChargeProps } from "./BadgeCharge.type";
import { styles } from "../../../styles/components/fynduo/BadgeCharge/BadgeCharge.style";

const BadgeCharge: React.FC<BadgeChargeProps> = ({
  chargeScope,
  chargeType,
  chargeNature,
}) => {
  const isFromSharedHousehold = chargeScope === "partage";
  const isFixedCharge = chargeType === "fixe";
  const isRemboursementCharge = chargeNature === "remboursement"

  return (
    <View style={styles.container}>
      {isRemboursementCharge ? 
      <View
          style={[
            styles.badge,
            styles.remboursementBadge,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              styles.remboursementBadgeText,
            ]}
          >
            {"Remboursement"}
          </Text>
        </View>
      : 
      <><View
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
        </View><View
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
          </View></>
      }
      
    </View>
  );
};

export default BadgeCharge;
