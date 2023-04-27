import { Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme, vars } from '../../../utils/theme';
import NonContactProfilePicture from '../../ui/NonContactProfilePicture';
import ProfilePicture from '../../ui/ProfilePicture';
type Props = {
  name: string;
  isContact: boolean;
  style?: object;
};

const NearbyAvatar = ({ name, style, isContact }: Props) => {
  const styles = getStyles();
  const ringStyle = isContact ? styles.ring : styles.darkRing;
  const textStyle = isContact
    ? [theme.textBody, styles.nameText]
    : [theme.textBody, styles.nameText, styles.darkText];

  return (
    <View style={[styles.container, style]}>
      <View style={ringStyle}>
        {isContact ? (
          <ProfilePicture size="lg" title={name} />
        ) : (
          <NonContactProfilePicture size="lg" />
        )}
      </View>
      <Text style={textStyle}>{name}</Text>
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
      padding: 2,
    },
    darkRing: {
      borderWidth: 1.75,
      borderColor: '#088712',
      padding: 2,
      borderRadius: 70,
    },
    nameText: {
      lineHeight: 16.47,
      marginTop: 10,
      textAlign: 'center',
    },
    darkText: {
      color: vars.white.darkest,
    },
  });
}

export default NearbyAvatar;
