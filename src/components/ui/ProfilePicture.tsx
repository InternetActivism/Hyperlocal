import React from 'react';
import { StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  sm: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#d3d3d3',
  },

  md: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#d3d3d3',
  },

  lg: {
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: '#d3d3d3',
  },
});

const ProfilePicture = ({
  size,
  extraStyle,
}: {
  size: 'sm' | 'md' | 'lg';
  extraStyle?: any;
}) => {
  return <View style={[styles[size], extraStyle]} />;
};

export default ProfilePicture;
