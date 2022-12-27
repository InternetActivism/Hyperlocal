import { Text } from '@rneui/themed';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme, vars } from '../../../utils/theme';
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
      <Text style={[styles.nameText, theme.textBody]}>{name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: 90,
    alignItems: 'center',
  },
  ring: {
    borderWidth: 3,
    borderColor: vars.green.soft,
    padding: 2,
    width: 90,
    height: 90,
    borderRadius: 70,
  },
  nameText: {
    lineHeight: 16.47,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default NearbyAvatar;
