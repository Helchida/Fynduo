import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "./ChargeItem.style";
import { ChargeItemProps } from "./ChargeItem.type";
import { useCategories } from "hooks/useCategories";
import { useAuth } from "hooks/useAuth";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { getDisplayNameUserInHousehold } from "utils/getDisplayNameUserInHousehold";
import BadgeCharge from "components/fynduo/BadgeCharge/BadgeCharge";
import { DEFAULT_CATEGORIES } from "constants/categories";

const ChargeItem: React.FC<ChargeItemProps> = ({
  charge,
  householdUsers,
  onPress,
}) => {
  const { user } = useAuth();

  if (!user) {
    return <NoAuthenticatedUser />;
  }

  const { categories } = useCategories();

  const payeurName = getDisplayNameUserInHousehold(
    charge.payeur,
    householdUsers,
  );

  const currentCategoryData = categories.find((cat) =>
    charge.type === "variable"
      ? cat.id === charge.categorie
      : cat.id === "cat_autre",
  );
  const categoryIcon = currentCategoryData ? currentCategoryData.icon : "📦";
  const isActiveHouseholdSolo = user.activeHouseholdId === user.id;
  const isFromSharedHousehold = charge.householdId !== user.id;

  const montantAffiche =
    isActiveHouseholdSolo && isFromSharedHousehold
      ? (charge.montantTotal / (charge.beneficiaires?.length || 1)).toFixed(2)
      : charge.montantTotal.toFixed(2);

  return (
    <TouchableOpacity
      style={styles.depenseItem}
      onPress={() => onPress(charge)}
    >
      <View style={styles.avatarBadge}>
        <Text style={styles.avatarText}>{categoryIcon}</Text>
      </View>

      <View style={styles.depenseInfo}>
        <Text style={styles.depenseDesc}>{charge.description}</Text>

        {!isActiveHouseholdSolo && (
          <Text style={styles.depensePayer}>Payé par {payeurName}</Text>
        )}
      </View>

      <View style={styles.depenseMontantContainer}>
        <BadgeCharge chargeScope={charge.scope} chargeType={charge.type} />
        <Text style={styles.depenseMontant}>{montantAffiche} €</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ChargeItem;
