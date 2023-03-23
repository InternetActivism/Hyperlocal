import * as React from 'react';
import { Image, StyleSheet } from 'react-native';

const HyperlocalMiniIcon = () => (
  <Image source={require('../../../assets/images/HyperlocalMiniIcon.png')} style={styles.image} />
);

const styles = StyleSheet.create({
  image: {
    height: 42,
    width: 42,
  },
});

export default HyperlocalMiniIcon;
