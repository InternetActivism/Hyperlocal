import React from 'react';
import { Image, StyleSheet } from 'react-native';

type Props = {
  size?: 'sm' | 'md';
};

const GlobeIcon = ({ size = 'md' }: Props) => (
  <Image source={require('../../../assets/images/PublicChatIcon.png')} style={styles[size]} />
);

const styles = StyleSheet.create({
  sm: {
    height: 44,
    width: 44,
  },
  md: {
    height: 65,
    width: 65,
  },
});

export default GlobeIcon;
