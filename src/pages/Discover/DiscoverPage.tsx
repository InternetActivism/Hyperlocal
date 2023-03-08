import { Text } from '@rneui/themed';
import { useAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { DefaultHeader } from '../../components';
import Spacer from '../../components/common/Spacer';
import NearbyAvatarGrid from '../../components/features/Discover/NearbyAvatarGrid';
import AlertBubble from '../../components/ui/AlertBubble';
import GlobeIcon from '../../components/ui/Icons/GlobeIcon';
import LockIcon from '../../components/ui/Icons/LockIcon';
import {
  allContactsAtom,
  connectionInfoAtomInterface,
  getActiveConnectionsAtom,
} from '../../services/atoms';
import { theme, vars } from '../../utils/theme';

const DiscoverPage = () => {
  const [connections] = useAtom(getActiveConnectionsAtom);
  const [allContacts] = useAtom(allContactsAtom);
  const [connectionInfo] = useAtom(connectionInfoAtomInterface);
  const [contactConnections, setContactConnections] = useState<string[]>([]);
  const nonContactConnections = connections.filter(
    (connection) => !allContacts.includes(connection)
  );

  // Cause page refresh when allContacts changes.
  useEffect(() => {
    setContactConnections(connections.filter((connection) => allContacts.includes(connection)));
  }, [allContacts, connections, connectionInfo]);

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
              <Text style={theme.textSectionHeader}>Public Chat</Text>
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
              <Text style={[styles.noNearbyPeersText, theme.textLarge]}>
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
                <Text style={theme.textSectionHeader}>Nearby Contacts</Text>
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
                <Text style={theme.textSectionHeader}>Nearby Users</Text>
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
  publicChatContainer: {
    height: 95,
    marginHorizontal: 15,
    marginBottom: 18,
    marginTop: 12,
  },
  publicChatBox: {
    backgroundColor: vars.backgroundColorSecondary,
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
    marginTop: 20,
    alignContent: 'center',
  },
});

export default DiscoverPage;
