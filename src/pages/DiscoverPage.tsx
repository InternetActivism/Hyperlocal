import { Text } from '@rneui/themed';
import { useAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import DefaultHeader from '../components/common/DefaultHeader';
import Spacer from '../components/common/Spacer';
import NearbyAvatarGrid from '../components/features/Discover/NearbyAvatarGrid';
import PublicChatButton from '../components/features/Discover/PublicChatButton';
import {
  allContactsAtom,
  connectionInfoAtomInterface,
  getActiveConnectionsAtom,
} from '../services/atoms';
import { theme, vars } from '../utils/theme';

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
        <Spacer />
        {connections.length === 0 ? (
          <>
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
            <View style={styles.nearbyUsersContainer}>
              <View style={styles.subHeaderContainer}>
                <Text style={theme.textSectionHeader}>Nearby Users</Text>
              </View>
              <NearbyAvatarGrid connections={nonContactConnections} />
            </View>
          </>
        ) : null}
        <Spacer />
        <View style={styles.alertBlock}>
          <View style={styles.alertContainer}>
            <Text style={theme.textSmallMonospace}>REMINDER</Text>
            <Text style={[theme.textSectionHeaderLarge, styles.alertTitle]}>
              Hyperlocal is in alpha!
            </Text>
            <Text style={styles.alertSubscript}>
              Please shake to report any issues you encounter and avoid using in high-risk
              situations until public launch. Anonymized analytics are enabled.
            </Text>
          </View>
        </View>
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
    paddingVertical: 10,
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
    alignContent: 'center',
    color: vars.gray.soft,
  },
  alertBlock: {
    marginTop: 20,
    flexDirection: 'column',
    alignItems: 'center',
  },
  alertContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 352,
    backgroundColor: '#191A19',
    paddingVertical: 20,
    borderRadius: 10,
    justifyContent: 'center',
  },
  alertSubscript: {
    color: '#7E837E',
    textAlign: 'center',
    width: 270,
    fontFamily: vars.fontFamilySecondary,
    fontSize: vars.fontSizeBodyLarge,
    fontWeight: vars.fontWeightRegular,
  },
  alertTitle: {
    color: '#C9C9C9',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
    lineHeight: 28,
    fontFamily: vars.fontFamilyPrimary,
    fontSize: vars.fontSizeHeaderSmall,
    fontWeight: vars.fontWeightRegular,
  },
});

export default DiscoverPage;
