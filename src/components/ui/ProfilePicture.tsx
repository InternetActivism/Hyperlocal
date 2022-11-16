import React from 'react';
import { StyleSheet, View } from 'react-native';

const allStyles = {
  sm: StyleSheet.create({
    container: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: '#d3d3d3',
    },
  }),
  md: StyleSheet.create({
    container: {
      width: 65,
      height: 65,
      borderRadius: 32.5,
      backgroundColor: '#d3d3d3',
    },
  }),
  lg: StyleSheet.create({
    container: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: '#d3d3d3',
    },
  }),
};

const ProfilePicture = ({ size }: { size: 'sm' | 'md' | 'lg' }) => {
  return <View style={allStyles[size].container} />;
};

export default ProfilePicture;
