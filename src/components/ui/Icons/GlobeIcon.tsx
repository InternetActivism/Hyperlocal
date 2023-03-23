import * as React from 'react';
import { Image, StyleSheet } from 'react-native';

const GlobeIcon = () => (
  <Image source={require('../../../assets/images/PublicChatIcon.png')} style={styles.image} />
);

const styles = StyleSheet.create({
  image: {
    height: 65,
    width: 65,
  },
});

export default GlobeIcon;
