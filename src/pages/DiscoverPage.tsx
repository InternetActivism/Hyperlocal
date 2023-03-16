import { Text } from '@rneui/themed';
import DefaultHeader from 'components/common/DefaultHeader';
import Spacer from 'components/common/Spacer';
import NearbyAvatarGrid from 'components/features/Discover/NearbyAvatarGrid';
import PublicChatButton from 'components/features/Discover/PublicChatButton';
import { useAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import {
  allContactsAtom,
  connectionInfoAtomInterface,
  getActiveConnectionsAtom,
} from 'services/atoms';
import { theme, vars } from 'utils/theme';

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
        <PublicChatButton connections={connections} />
        {connections.length === 0 ? (
          <>
            <Spacer />
            <View style={styles.subHeaderContainer}>
              <Text style={[theme.textLarge, styles.noNearbyPeersText]}>
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
  nearbyUsersContainer: {
    marginTop: 15,
  },
  noNearbyPeersText: {
    marginTop: 20,
    alignContent: 'center',
    color: vars.gray.soft,
  },
});

export default DiscoverPage;
