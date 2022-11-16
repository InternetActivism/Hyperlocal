import { Text } from '@rneui/themed';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { DefaultHeader, ProfilePicture } from '../../components';
import { Message } from '../../services/database';

const DiscoverPage = () => {
  return (
    <SafeAreaView>
      <DefaultHeader pageName="Discover" />
      <View style={styles.nearbyPeersContainer}>
        <Text style={styles.subHeader}>Nearby Peers</Text>
        <View style={styles.nearbyPeersAvatarContainer}>
          <ProfilePicture size="lg" />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  subHeader: {
    fontSize: 23,
    fontFamily: 'Rubik-Medium',
    fontWeight: '500',
  },
  nearbyPeersContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  nearbyPeersAvatarContainer: {
    paddingVertical: 10,
  },
});

export default DiscoverPage;
