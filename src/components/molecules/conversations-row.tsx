import { Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LastSeenBubble, ProfilePictureMedium } from '../atoms';

type Props = {
  name: string;
};

const ConversationsRow = ({ name }: Props) => {
  return (
    <View style={styles.container}>
      <ProfilePictureMedium />
      <View style={styles.textContainer}>
        <Text style={styles.nameText}>{name}</Text>
        <LastSeenBubble />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    height: 65,
    width: '100%',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 15,
  },
  nameText: {
    fontSize: 18,
    fontFamily: 'Rubik-Medium',
    lineHeight: 23,
  },
  lastSeenText: {},
});

export default ConversationsRow;
