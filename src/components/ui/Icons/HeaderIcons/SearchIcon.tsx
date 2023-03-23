import * as React from 'react';
import { Image, StyleSheet } from 'react-native';

const SearchIcon = () => (
  <Image source={require('../../../../assets/images/HeaderIcon9.png')} style={styles.image} />
);

const styles = StyleSheet.create({
  image: {
    height: 35,
    width: 35,
  },
});

export default SearchIcon;
