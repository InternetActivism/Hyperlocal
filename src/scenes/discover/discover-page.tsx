import { Text } from '@rneui/themed';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { DefaultHeader, ProfilePicture } from '../../components';
import { Message } from '../../services/database';

const DiscoverPage = () => {
  return (
    <SafeAreaView>
      <DefaultHeader pageName="Discover" />
      <ProfilePicture size="lg" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    paddingHorizontal: 27,
    marginTop: 25,
    width: '100%',
    height: 65,
  },
});

export default DiscoverPage;
