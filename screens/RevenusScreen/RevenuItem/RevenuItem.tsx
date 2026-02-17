import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "./RevenuItem.style";
import { useCategories } from "hooks/useCategories";
import { useAuth } from "hooks/useAuth";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { RevenuItemProps } from "./RevenuItem.type";

const RevenuItem: React.FC<RevenuItemProps> = ({
  revenu,
  onPress,
}) => {
  const { user } = useAuth();

  if (!user) {
    return <NoAuthenticatedUser />;
  }

  const { categoriesRevenus } = useCategories();

  const currentCategoryData = categoriesRevenus.find((cat) =>
    cat.id === revenu.categorie
  );
  const categoryIcon = currentCategoryData ? currentCategoryData.icon : "💵";
  const montantAffiche = revenu.montant.toFixed(2);

  return (
    <TouchableOpacity
      style={styles.revenuItem}
      onPress={() => onPress(revenu)}
    >
      <View style={styles.avatarBadge}>
        <Text style={styles.avatarText}>{categoryIcon}</Text>
      </View>

      <View style={styles.revenuInfo}>
        <Text style={styles.revenuDesc}>{revenu.description}</Text>
      </View>

      <View style={styles.revenuMontantContainer}>
        <Text style={styles.revenuMontant}>{montantAffiche} €</Text>
      </View>
    </TouchableOpacity>
  );
};

export default RevenuItem;
