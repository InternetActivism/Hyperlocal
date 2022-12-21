import { Text } from '@rneui/themed';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

interface Props {
  primary: boolean;
  text: string;
}

const AlertBubble = ({ primary, text }: Props) => {
  const styles = getStyles(primary);
  return (
    <View style={styles.container}>
      <Text style={styles.bubbleText}>{text}</Text>
    </View>
  );
};

const getStyles = (primary: boolean) =>
  StyleSheet.create({
    container: {
      alignSelf: 'flex-start',
      flexDirection: 'column',
      justifyContent: 'center',
      height: 22,
      borderRadius: 11,
      backgroundColor: primary ? '#E3F5FB' : '#F6F6F6',
    },
    bubbleText: {
      paddingHorizontal: 10,
      fontSize: 13,
      fontFamily: 'Rubik-Medium',
      color: primary ? '#0196FD' : '#9199A5',
    },
  });

export default AlertBubble;
