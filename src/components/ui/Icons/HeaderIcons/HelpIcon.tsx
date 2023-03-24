import React from 'react';
import { Image, StyleSheet } from 'react-native';

const HelpIcon = () => (
  <Image source={require('../../../../assets/images/HeaderIcon6.png')} style={styles.image} />
);

const styles = StyleSheet.create({
  image: {
    height: 35,
    width: 35,
  },
});

export default HelpIcon;
