import React from "react";
import { View, Text } from "react-native";
import { styles } from "../../../styles/screens/ChargeDetailScreen/UserDisplayCard/UserDisplayCard.style";
import { common } from "styles/common.style";
import AvatarName from "components/ui/AvatarName/AvatarName";
import { UserDisplayCardProps } from "./UserDisplayCard.type";

export const UserDisplayCard = ({
  name,
  amount,
  isPayeur,
  isMe,
}: UserDisplayCardProps) => (
  <View style={[common.userCard, isPayeur && common.payorCard]}>
    <AvatarName name={name} />

    <View style={{ flex: 1, marginLeft: 10 }}>
      <Text style={styles.userName} numberOfLines={1}>
        {name}
        {isMe && <Text style={styles.userCurrentTag}> (Moi)</Text>}
      </Text>
    </View>

    <Text style={common.cardAmount}>{amount} €</Text>
  </View>
);
