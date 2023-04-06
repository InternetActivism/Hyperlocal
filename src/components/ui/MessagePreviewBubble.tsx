import { Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { vars } from '../../utils/theme';

interface Props {
  text: string;
}

const MessagePreviewBubble = ({ text }: Props) => {
  const styles = getStyles();
  return (
    <View style={styles.container}>
      <Text style={styles.bubbleText}>{text}</Text>
    </View>
  );
};

const getStyles = () =>
  StyleSheet.create({
    icon: {
      paddingRight: 5,
    },
    container: {
      display: 'flex',
      alignSelf: 'flex-start',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      height: 22,
      borderRadius: 11,
      borderBottomLeftRadius: 0,
      borderWidth: 1,
      backgroundColor: vars.backgroundColorSecondary,
      borderColor: vars.backgroundColorSecondary,
      paddingHorizontal: 8,
    },
    bubbleText: {
      paddingTop: 0.5,
      fontSize: 13,
      fontFamily: vars.fontFamilySecondary,
      fontWeight: vars.fontWeightMedium,
      color: vars.gray.softest,
    },
  });

export default MessagePreviewBubble;
