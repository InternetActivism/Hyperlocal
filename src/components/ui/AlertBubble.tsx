import { Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { vars } from '../../utils/theme';
import BluetoothOnIcon from './Icons/BluetoothIcon/BluetoothIconOn';

interface Props {
  primary: boolean;
  text: string;
}

const AlertBubble = ({ primary, text }: Props) => {
  const styles = getStyles(primary);
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

const getStyles = (primary: boolean) =>
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
      borderWidth: 1,
      backgroundColor: primary ? vars.backgroundColorGreen : vars.backgroundColorSecondary,
      borderColor: primary ? vars.primaryColor.darkest : vars.backgroundColorSecondary,
      paddingHorizontal: 8,
    },
    bubbleText: {
      paddingTop: 0.5,
      fontSize: 12,
      fontFamily: vars.fontFamilySecondary,
      fontWeight: vars.fontWeightMedium,
      color: primary ? vars.primaryColor.text : vars.gray.softest,
    },
  });

export default AlertBubble;
