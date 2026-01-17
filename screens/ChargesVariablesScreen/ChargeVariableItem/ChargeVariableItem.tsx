import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "./ChargeVariableItem.style";
import { ChargeVariableItemProps } from "./ChargeVariableItem.type";
import { useCategories } from "hooks/useCategories";
import { useAuth } from "hooks/useAuth";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { getDisplayNameUserInHousehold } from "utils/getDisplayNameUserInHousehold";

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
    householdUsers
  );

  const currentCategoryData = categories.find(
    (cat) => cat.id === charge.categorie
  );
  const categoryIcon = currentCategoryData ? currentCategoryData.icon : "📦";

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
        <Text style={styles.depensePayer}>Payé par {payeurName}</Text>
      </View>
      <View style={styles.depenseDetails}>
        <Text style={styles.depenseAmount}>
          {charge.montantTotal.toFixed(2)} €
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ChargeVariableItem;
