import React from 'react';
import { StyleSheet } from 'react-native';
import { Avatar } from '@rneui/themed';
import stringToColor from '../../utils/stringToColor';

const ProfilePicture = ({
  size,
  title,
  extraStyle,
  props,
}: {
  size: 'sm' | 'md' | 'lg' | 'xl';
  title: string;
  extraStyle?: any;
  props?: any;
}) => {
  const generatedColor = stringToColor(title);

  const avatarTitle = title
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .slice(0, 2);

  return (
    <Avatar
      containerStyle={[containerStyles[size], extraStyle, { backgroundColor: generatedColor }]}
      titleStyle={textStyles[size]}
      title={avatarTitle}
      {...props}
    />
  );
};

const containerStyles = StyleSheet.create({
  sm: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },

  md: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
  },

  lg: {
    width: 90,
    height: 90,
    borderRadius: 50,
  },
  xl: {
    width: 122,
    height: 122,
    borderRadius: 75,
  },
});

const textStyles = StyleSheet.create({
  sm: {
    fontSize: 20,
    fontFamily: 'Helvetica',
  },
  md: {
    fontSize: 32,
    fontFamily: 'Helvetica',
  },
  lg: {
    fontSize: 42,
    fontFamily: 'Helvetica',
  },
  xl: {
    fontSize: 72,
    fontFamily: 'Helvetica',
  },
});

export default ProfilePicture;
