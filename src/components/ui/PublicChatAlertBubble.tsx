import { Text } from '@rneui/themed';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { vars } from '../../utils/theme';
import BluetoothIcon from './Icons/BluetoothIcon';

interface Props {
  text: string;
}

const PublicChatAlertBubble = ({ text }: Props) => {
  return (
    <View style={styles.container}>
      <BluetoothIcon />
      <Text style={styles.bubbleText}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    alignSelf: 'flex-start',
    alignContent: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    // center vertically in flex
    alignItems: 'center',
    height: 25,
    borderRadius: 15,
    borderWidth: 1,
    // backgroundColor: '#252625',
    background: 'linear-gradient(360deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%), #252625',
    boxShadow: '0px 0px 1px #282A28, inset 0px 0px 4px rgba(0, 0, 0, 0.3)',
    borderColor: '#444444',
    paddingHorizontal: 10,
  },
  bubbleText: {
    paddingLeft: 5,
    paddingTop: 1,
    fontSize: 13,
    fontFamily: vars.fontFamilySecondary,
    fontWeight: '700',
    color: '#9B9B9B',
  },
});

export default PublicChatAlertBubble;
