import { Text } from '@rneui/themed';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme, vars } from '../../../utils/theme';
import ProfilePicture from '../../ui/ProfilePicture';
type Props = {
  name: string;
  id: string;
  isContact: boolean;
  style?: object;
};

const NearbyAvatar = ({ name, id, isContact, style }: Props) => {
  const styles = getStyles(isContact);
  return (
    <View style={[styles.container, style]}>
      <View style={styles.ring}>
        <ProfilePicture size="lg" title={name} id={id} />
      </View>
      <Text style={[styles.nameText, theme.textBody]}>{name}</Text>
    </View>
  );
};

function getStyles(isContact: boolean) {
  return StyleSheet.create({
    container: {
      maxWidth: 90,
      alignItems: 'center',
    },
    ring: {
      borderWidth: 3,
      borderColor: isContact ? vars.primaryColor.soft : vars.gray.softest,
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
}

export default NearbyAvatar;
