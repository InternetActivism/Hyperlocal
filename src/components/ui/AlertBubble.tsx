import { Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { vars } from '../../utils/theme';
import BluetoothOnIcon from './Icons/BluetoothIcon/BluetoothIconOn';

interface Props {
  primary: boolean;
  text: string;
  height?: number;
  largeText?: boolean;
  noBorder?: boolean;
}

const AlertBubble = ({ primary, text, height, largeText, noBorder }: Props) => {
  const styles = getStyles(primary, height, largeText, noBorder);
  return (
    <View style={styles.container}>
      {primary && (
        <View style={styles.icon}>
          <BluetoothOnIcon />
        </View>
      )}
      <Text style={styles.bubbleText}>{text}</Text>
    </View>
  );
};

const getStyles = (primary: boolean, height?: number, largeText?: boolean, noBorder?: boolean) =>
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
      height: height || 22,
      borderRadius: 9999,
      borderWidth: noBorder ? 0 : 1,
      backgroundColor: primary ? vars.backgroundColorGreen : vars.backgroundColorSecondary,
      borderColor: primary ? vars.primaryColor.darkest : vars.backgroundColorSecondary,
      paddingHorizontal: 10,
    },
    bubbleText: {
      paddingTop: largeText ? 1 : 0.5,
      fontSize: largeText ? 14 : 12,
      fontFamily: vars.fontFamilySecondary,
      fontWeight: vars.fontWeightMedium,
      color: primary ? vars.primaryColor.text : vars.gray.softest,
    },
  });

export default AlertBubble;
