import React from 'react';
import { Image, StyleSheet } from 'react-native';

const RefreshIconPNG = () => (
  <Image source={require('../../../assets/images/RefreshButton.png')} style={styles.image} />
);

const styles = StyleSheet.create({
  image: {
    height: 14,
    width: 69,
  },
});

export default RefreshIconPNG;
