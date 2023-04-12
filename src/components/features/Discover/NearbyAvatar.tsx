import { Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme, vars } from '../../../utils/theme';
import ProfilePicture from '../../ui/ProfilePicture';
type Props = {
  name: string;
  id: string;
  isContact: boolean;
  style?: object;
};

const NearbyAvatar = ({ name, style }: Props) => {
  const styles = getStyles();
  return (
    <View style={[styles.container, style]}>
      <ProfilePicture size="lg" title={name} connectedDecoration={true} />
      <Text style={[styles.nameText, theme.textBody]}>{name}</Text>
    </View>
  );
};

function getStyles() {
  return StyleSheet.create({
    container: {
      maxWidth: 90,
      alignItems: 'center',
    },
    ring: {
      borderWidth: 1.75,
      borderColor: vars.primaryColor.soft,
      borderRadius: 70,
    },
    nameText: {
      lineHeight: 16.47,
      marginTop: 10,
      textAlign: 'center',
    },
  });
}

export default NearbyAvatar;
