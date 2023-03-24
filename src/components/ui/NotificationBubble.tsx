import { Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { vars } from '../../utils/theme';

interface Props {
  count: number;
}

const NotificationBubble = ({ count }: Props) => {
  return (
    <View style={styles.unreadBubble}>
      <Text style={styles.unreadText}>{count}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  unreadBubble: {
    height: 24,
    paddingHorizontal: 7,
    minWidth: 24,
    borderRadius: 12,
    backgroundColor: vars.green.sharp,
    position: 'absolute',
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    fontFamily: vars.fontFamilyPrimary,
    fontSize: 20,
    fontWeight: vars.fontWeightSemibold,
    color: vars.black.sharp,
    textAlign: 'center',
  },
});

export default NotificationBubble;
