import { Text } from '@rneui/themed';
import { useAtom, useAtomValue } from 'jotai';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { DefaultHeader } from '../../components';
import Spacer from '../../components/common/Spacer';
import NearbyAvatarGrid from '../../components/features/Discover/NearbyAvatarGrid';
import { allContactsAtom, getActiveConnectionsAtom } from '../../services/atoms';
import { theme } from '../../utils/theme';
import PublicChatButton from '../../components/features/Discover/PublicChatButton';

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
          <PublicChatButton connections={connections} />
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
  nearbyUsersContainer: {
    marginTop: 15,
  },
  noNearbyPeersText: {
    marginTop: 20,
    alignContent: 'center',
  },
});

export default DiscoverPage;
