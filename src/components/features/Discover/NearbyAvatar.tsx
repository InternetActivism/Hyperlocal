import { Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LastSeenBubble, ProfilePicture } from '../../ui';

type Props = {
  name: string;
};

const NearbyAvatar = ({ name }: Props) => {
  return (
    <View>
      <View style={styles.ring}>
        <ProfilePicture size="lg" />
      </View>
      <Text>{name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  ring: {
    borderWidth: 5,
    borderColor: '008CFF',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    height: 65,
    width: '100%',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 15,
  },
  nameText: {
    fontSize: 18,
    fontFamily: 'Rubik-Medium',
    lineHeight: 23,
  },
  lastSeenText: {},
});

export default NearbyAvatar;
