import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ProfilePictureIcon from './Icons/ProfilePictureIcon';

const ProfilePicture = ({
  size,
  title,
  extraStyle,
}: {
  size: 'sm' | 'md' | 'lg' | 'xl';
  title: string;
  extraStyle?: any;
}) => {
  const avatarTitle = title
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .slice(0, 2);

  const container = containerStyles[size];

  return (
    <View style={[container, extraStyle, containerStyles.main]}>
      <Text style={[textStyles[size], textStyles.main]}>{avatarTitle}</Text>
      <ProfilePictureIcon width={container.width} height={container.height} />
    </View>
  );
};

const containerStyles = StyleSheet.create({
  main: {
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    width: 80,
    height: 80,
    borderRadius: 50,
  },
  xl: {
    width: 122,
    height: 122,
    borderRadius: 75,
  },
});

const textStyles = StyleSheet.create({
  main: {
    position: 'absolute',
    zIndex: 1,
    color: '#9AA39B',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  sm: {
    fontSize: 20,
    fontFamily: 'Helvetica',
  },
  md: {
    fontSize: 32,
    fontFamily: 'Helvetica',
  },
  lg: {
    fontSize: 35,
    fontFamily: 'Helvetica',
  },
  xl: {
    fontSize: 72,
    fontFamily: 'Helvetica',
  },
});

export default ProfilePicture;
