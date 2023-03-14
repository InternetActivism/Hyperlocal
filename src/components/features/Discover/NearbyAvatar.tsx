import { Text } from '@rneui/themed';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme, vars } from '../../../utils/theme';
import ProfilePicture from '../../ui/ProfilePicture';
type Props = {
  name: string;
  id: string;
  style?: object;
};

const NearbyAvatar = ({ name, id, style }: Props) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.ring}>
        <ProfilePicture size="lg" title={name} id={id} />
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
    borderColor: vars.primaryColor.soft,
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
