import { Text } from '@rneui/themed';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { vars } from '../../utils/theme';

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
      borderWidth: 1,
      backgroundColor: primary ? vars.backgroundColorGreen : vars.backgroundColorSecondary,
      borderColor: primary ? vars.green.darkest : vars.backgroundColorSecondary,
    },
    bubbleText: {
      paddingHorizontal: 10,
      fontSize: 13,
      fontFamily: vars.fontFamilySecondary,
      fontWeight: '700',
      color: primary ? vars.green.text : vars.gray.softest,
    },
  });

export default AlertBubble;
