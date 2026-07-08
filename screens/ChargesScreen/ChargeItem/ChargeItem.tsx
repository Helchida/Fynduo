import React, { useMemo } from "react";
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

  const repartitionMap = useMemo(() => {
    if (!charge.repartition) return null;
    try {
      return typeof charge.repartition === "string"
        ? (JSON.parse(charge.repartition) as Record<string, number>)
        : (charge.repartition as Record<string, number>);
    } catch (e) {
      console.error("Erreur de parsing de la répartition dans ChargeItem :", e);
      return null;
    }
  }, [charge.repartition]);

  const montantAffiche = useMemo(() => {
    if (isActiveHouseholdSolo && isFromSharedHousehold) {
      if (repartitionMap && repartitionMap[user.id] !== undefined) {
        return repartitionMap[user.id].toFixed(2);
      }
      return (charge.montantTotal / (charge.beneficiaires?.length || 1)).toFixed(2);
    }
    
    return charge.montantTotal.toFixed(2);
  }, [isActiveHouseholdSolo, isFromSharedHousehold, charge.montantTotal, charge.beneficiaires, repartitionMap, user.id]);

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
        <BadgeCharge chargeScope={charge.scope} chargeType={charge.type} chargeNature={charge.nature}/>
        <Text style={common.cashFlowMontant}>{montantAffiche} €</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ChargeItem;