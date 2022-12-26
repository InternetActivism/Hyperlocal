import { Text } from '@rneui/themed';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { ProfilePicture } from '../../ui';

type Props = {
  name: string;
  style?: object;
};

const NearbyAvatar = ({ name, style }: Props) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.ring}>
        <ProfilePicture size="lg" title={name} />
      </View>
      <Text style={styles.nameText}>{name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: 110,
    maxHeight: 110,
    alignItems: 'center',
  },
  ring: {
    borderWidth: 4,
    borderColor: '#008CFF',
    padding: 1,
    width: 90,
    height: 90,
    borderRadius: 70,
  },
  nameText: {
    fontSize: 14,
    fontFamily: 'Rubik',
    fontWeight: '400',
    lineHeight: 16.47,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default NearbyAvatar;
