import * as React from 'react';
import { Image, StyleSheet } from 'react-native';

const BluetoothOnIcon = () => (
  <Image source={require('../../../../assets/images/BluetoothOn.png')} style={styles.image} />
);

const styles = StyleSheet.create({
  image: {
    height: 11,
    width: 9,
  },
});

export default BluetoothOnIcon;
