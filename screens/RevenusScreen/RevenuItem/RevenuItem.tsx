import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { common } from "styles/common.style";
import { useCategories } from "hooks/useCategories";
import { useAuth } from "hooks/useAuth";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { RevenuItemProps } from "./RevenuItem.type";
import { styles } from "../../../styles/screens/RevenusScreen/RevenuItem/RevenuItem.style";

const RevenuItem: React.FC<RevenuItemProps> = ({ revenu, onPress }) => {
  const { user } = useAuth();

  if (!user) {
    return <NoAuthenticatedUser />;
  }

  const { categoriesRevenus } = useCategories();

  const currentCategoryData = categoriesRevenus.find(
    (cat) => cat.id === revenu.categorie,
  );
  const categoryIcon = currentCategoryData ? currentCategoryData.icon : "💵";
  const montantAffiche = revenu.montant.toFixed(2);

  const isRetraitEpargne = revenu.categorie === "cat_retrait_epargne";

  const content = (
    <>
      <View style={common.avatarBadge}>
        <Text style={common.avatarText}>{categoryIcon}</Text>
      </View>

      <View style={common.cashFlowInfo}>
        <Text style={common.cashFlowDesc}>{revenu.description}</Text>
        {isRetraitEpargne && (
          <Text style={[common.cashFlowPayer, styles.subTextEpargne]}>
            Retrait d'épargne
          </Text>
        )}
      </View>

      <View style={common.cashFlowMontantContainer}>
        {isRetraitEpargne && (
          <View style={styles.badgeContainerEpargne}>
            <Text style={styles.badgeTextEpargne}>ÉPARGNE</Text>
          </View>
        )}
        <Text style={[common.cashFlowMontant]}>+{montantAffiche} €</Text>
      </View>
    </>
  );

  if (isRetraitEpargne) {
    return <View style={styles.containerEpargne}>{content}</View>;
  }

  return (
    <TouchableOpacity
      style={common.cashFlowItem}
      onPress={() => onPress(revenu)}
      activeOpacity={0.7}
    >
      {content}
    </TouchableOpacity>
  );
};

export default RevenuItem;
