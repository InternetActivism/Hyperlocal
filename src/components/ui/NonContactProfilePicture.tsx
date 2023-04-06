import React from 'react';
import { StyleSheet, View } from 'react-native';
import { vars } from '../../utils/theme';
import PlusIcon from './Icons/PlusIcon';
import ProfilePictureIcon from './Icons/ProfilePictureIcon';

const NonContactProfilePicture = ({
  size,
  extraStyle,
}: {
  size: 'xs' | 'sm' | 'md' | 'lg_s' | 'lg' | 'xl';
  extraStyle?: any;
}) => {
  const container = containerStyles[size];

  return (
    <View style={[container, extraStyle, containerStyles.main]}>
      <View style={[containerStyles.icon]}>
        <PlusIcon width={container.width / 2} height={container.height / 2} />
      </View>
      <View style={[containerStyles.background]}>
        <ProfilePictureIcon width={container.width} height={container.height} />
      </View>
    </View>
  );
};

const containerStyles = StyleSheet.create({
  icon: {
    zIndex: 1,
    position: 'absolute',
  },
  main: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  background: {
    position: 'absolute',
  },
  xs: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },

  sm: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },

  md: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
  },

  lg_s: {
    width: 68,
    height: 68,
    borderRadius: 33,
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
    fontFamily: vars.fontFamilyMonospace,
    zIndex: 1,
    color: '#9AA39B',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  xs: {
    fontSize: 20,
  },
  sm: {
    fontSize: 22,
  },
  md: {
    fontSize: 32,
  },
  lg_s: {
    fontSize: 36,
  },
  lg: {
    fontSize: 42,
  },
  xl: {
    fontSize: 60,
  },
});

export default NonContactProfilePicture;
