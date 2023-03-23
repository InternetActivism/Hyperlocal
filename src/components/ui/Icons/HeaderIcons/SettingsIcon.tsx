import * as React from 'react';
import { Image, StyleSheet } from 'react-native';

const SettingsIcon = () => (
  <Image source={require('../../../../assets/images/HeaderIcon7.png')} style={styles.image} />
);

const styles = StyleSheet.create({
  image: {
    height: 35,
    width: 35,
  },
});

export default SettingsIcon;
