import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { common } from "styles/common.style";
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
      style={common.cashFlowItem}
      onPress={() => onPress(revenu)}
    >
      <View style={common.avatarBadge}>
        <Text style={common.avatarText}>{categoryIcon}</Text>
      </View>

      <View style={common.cashFlowInfo}>
        <Text style={common.cashFlowDesc}>{revenu.description}</Text>
      </View>

      <View style={common.cashFlowMontantContainer}>
        <Text style={common.cashFlowMontant}>{montantAffiche} €</Text>
      </View>
    </TouchableOpacity>
  );
};

export default RevenuItem;
