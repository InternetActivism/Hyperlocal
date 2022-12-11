import { Text } from '@rneui/themed';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { DefaultHeader } from '../../components';
import { useAtom } from 'jotai';
import { connectionsAtomWithListener } from '../../services/atoms';
import NearbyAvatarGrid from '../../components/features/Discover/NearbyAvatarGrid';

const DiscoverPage = () => {
  const [connections] = useAtom(connectionsAtomWithListener);
  return (
    <SafeAreaView>
      <DefaultHeader pageName="Discover" />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.nearbyPeersContainer}>
          <Text style={styles.subHeader}>Nearby Peers</Text>
          {connections.length === 0 ? (
            <View>
              <Text style={styles.noNearbyPeersText}>
                No nearby peers found. Make sure Bluetooth is on and you're less
                than 300ft/100m away from another user.
              </Text>
            </View>
          ) : (
            <NearbyAvatarGrid connections={connections} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    height: '100%',
  },
  subHeader: {
    fontSize: 23,
    fontFamily: 'Rubik-Medium',
    fontWeight: '500',
  },
  nearbyPeersContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  extraAvatar: {
    opacity: 0,
  },
  noNearbyPeersText: {
    fontSize: 18,
    fontFamily: 'Rubik-Medium',
    fontWeight: '400',
    marginTop: 20,
    alignContent: 'center',
  },
});

export default DiscoverPage;
