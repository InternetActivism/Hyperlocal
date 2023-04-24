import { Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { vars } from '../../utils/theme';

interface Props {
  count: number;
  height: number;
}

const NotificationBubble = ({ count, height }: Props) => {
  const styles = getStyles(height);
  return (
    <View style={styles.unreadBubble}>
      <Text style={styles.unreadText}>{count}</Text>
    </View>
  );
};

const getStyles = (height: number) =>
  StyleSheet.create({
    unreadBubble: {
      height: height,
      paddingHorizontal: height / 3,
      minWidth: height,
      borderRadius: 9999,
      backgroundColor: vars.green.sharp,
    },
    unreadText: {
      fontFamily: vars.fontFamilyPrimary,
      fontSize: height * 0.83,
      fontWeight: vars.fontWeightSemibold,
      color: vars.black.sharp,
      textAlign: 'center',
    },
  });

export default NotificationBubble;
