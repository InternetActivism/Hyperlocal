import React from 'react';
import { Image, StyleSheet } from 'react-native';

interface Props {
  width: number;
  height: number;
}

const ProfilePictureIcon = ({ width, height }: Props) => {
  const styles = StyleSheet.create({
    image: {
      height,
      width,
    },
  });
  return (
    <Image source={require('../../../assets/images/ProfilePicture.png')} style={styles.image} />
  );
};

export default ProfilePictureIcon;
