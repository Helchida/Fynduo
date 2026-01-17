import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "./ChargeVariableItem.style";
import { ChargeVariableItemProps } from "./ChargeVariableItem.type";
import { useCategories } from "hooks/useCategories";
import { useAuth } from "hooks/useAuth";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { getDisplayNameUserInHousehold } from "utils/getDisplayNameUserInHousehold";
import BadgeHouseholdMode from "components/fynduo/BadgeHouseholdMode/BadgeHouseholdMode";

const ChargeVariableItem: React.FC<ChargeVariableItemProps> = ({
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

  const currentCategoryData = categories.find(
    (cat) => cat.id === charge.categorie,
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
        <BadgeHouseholdMode isFromSharedHousehold={isFromSharedHousehold} />
        <Text style={styles.depenseMontant}>{montantAffiche} €</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ChargeVariableItem;
