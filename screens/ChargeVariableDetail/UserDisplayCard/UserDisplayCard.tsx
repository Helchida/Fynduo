import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './UserDisplayCard.style';
import AvatarName from "components/ui/AvatarName/AvatarName";
import { UserDisplayCardProps } from './UserDisplayCard.type';

export const UserDisplayCard = ({ name, amount, isPayeur, isMe }: UserDisplayCardProps) => (
  <View style={[styles.userCard, isPayeur && styles.payorCard]}>
    <AvatarName name={name} />
    <Text style={styles.userName}>
      {name} {isMe && <Text style={styles.userCurrentTag}> (Moi)</Text>}
    </Text>
    <Text style={styles.cardAmount}>{amount} €</Text>
  </View>
);