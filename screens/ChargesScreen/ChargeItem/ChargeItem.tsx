import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { common } from "../../../styles/common.style";
import { ChargeItemProps } from "./ChargeItem.type";
import { useCategories } from "hooks/useCategories";
import { useAuth } from "hooks/useAuth";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { getDisplayNameUserInHousehold } from "utils/getDisplayNameUserInHousehold";
import BadgeCharge from "components/fynduo/BadgeCharge/BadgeCharge";


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
    cat.id === charge.categorie
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
      style={common.cashFlowItem}
      onPress={() => onPress(charge)}
    >
      <View style={common.avatarBadge}>
        <Text style={common.avatarText}>{categoryIcon}</Text>
      </View>

      <View style={common.cashFlowInfo}>
        <Text style={common.cashFlowDesc}>{charge.description}</Text>

        {!isActiveHouseholdSolo && (
          <Text style={common.cashFlowPayer}>Payé par {payeurName}</Text>
        )}
      </View>

      <View style={common.cashFlowMontantContainer}>
        <BadgeCharge chargeScope={charge.scope} chargeType={charge.type} />
        <Text style={common.cashFlowMontant}>{montantAffiche} €</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ChargeItem;
