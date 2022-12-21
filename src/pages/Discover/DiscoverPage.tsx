import { Text } from '@rneui/themed';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { DefaultHeader } from '../../components';
import { useAtom, useAtomValue } from 'jotai';
import { allContactsAtom, getActiveConnectionsAtom } from '../../services/atoms';
import NearbyAvatarGrid from '../../components/features/Discover/NearbyAvatarGrid';
import Spacer from '../../components/common/Spacer';
import GlobeIcon from '../../components/ui/Icons/GlobeIcon';
import AlertBubble from '../../components/ui/AlertBubble';
import LockIcon from '../../components/ui/Icons/LockIcon';

const DiscoverPage = () => {
  const [connections] = useAtom(getActiveConnectionsAtom);
  const allContacts = useAtomValue(allContactsAtom);
  const contactConnections = connections.filter((connection) => allContacts.includes(connection));
  const nonContactConnections = connections.filter(
    (connection) => !allContacts.includes(connection)
  );

  return (
    <SafeAreaView>
      <DefaultHeader pageName="Discover" />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.publicChatContainer}>
          <View style={styles.publicChatBox}>
            <View style={styles.globeIconContainer}>
              <GlobeIcon />
            </View>
            <View>
              <Text style={styles.subHeader}>Public Chat</Text>
              <View style={styles.comingSoonContainer}>
                <AlertBubble primary={true} text={'Coming Soon!'} />
              </View>
            </View>
            <View style={styles.lockIconContainer}>
              <LockIcon />
            </View>
          </View>
        </View>
        {connections.length === 0 ? (
          <>
            <Spacer />
            <View style={styles.subHeaderContainer}>
              <Text style={styles.noNearbyPeersText}>
                No nearby users found. Make sure Bluetooth is on and you're less than 300ft/100m
                away from another user.
              </Text>
            </View>
          </>
        ) : null}
        {contactConnections.length !== 0 ? (
          <>
            <Spacer />
            <View style={styles.nearbyUsersContainer}>
              <View style={styles.subHeaderContainer}>
                <Text style={styles.subHeader}>Nearby Contacts</Text>
              </View>
              <NearbyAvatarGrid connections={contactConnections} />
            </View>
          </>
        ) : null}
        {nonContactConnections.length !== 0 ? (
          <>
            <Spacer />
            <View style={styles.nearbyUsersContainer}>
              <View style={styles.subHeaderContainer}>
                <Text style={styles.subHeader}>Nearby Users</Text>
              </View>
              <NearbyAvatarGrid connections={nonContactConnections} />
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    height: '100%',
  },
  subHeaderContainer: {
    paddingHorizontal: 20,
  },
  subHeader: {
    fontSize: 23,
    fontFamily: 'Rubik-Medium',
    fontWeight: '500',
  },
  publicChatContainer: {
    height: 95,
    marginHorizontal: 20,
    marginBottom: 18,
    marginTop: 12,
  },
  publicChatBox: {
    backgroundColor: '#F6F6F6',
    flex: 1,
    flexDirection: 'row',
    borderRadius: 20,
    alignItems: 'center',
  },
  globeIconContainer: {
    paddingHorizontal: 17,
  },
  comingSoonContainer: {
    marginTop: 6,
  },
  lockIconContainer: {
    position: 'absolute',
    right: 15,
  },
  nearbyUsersContainer: {
    marginTop: 15,
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
