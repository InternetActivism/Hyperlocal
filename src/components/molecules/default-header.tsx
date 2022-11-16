import { Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ProfilePictureSmall } from '../atoms';

const DefaultHeader = ({ pageName }: { pageName: string }) => {
  return (
    <View style={styles.container}>
      <ProfilePictureSmall />
      <Text style={styles.text}>{pageName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 50,
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 26,
    fontFamily: 'Rubik-Medium',
    marginLeft: 17,
  },
});

export default DefaultHeader;
