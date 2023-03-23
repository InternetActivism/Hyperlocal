import { Text } from '@rneui/themed';
import { useAtom } from 'jotai';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import DefaultHeader from '../components/common/DefaultHeader';
import Spacer from '../components/common/Spacer';
import NearbyAvatarGrid from '../components/features/Discover/NearbyAvatarGrid';
import PublicChatButton from '../components/features/Discover/PublicChatButton';
import { getActiveConnectionsAtom } from '../services/atoms';
import { theme, vars } from '../utils/theme';

const DiscoverPage = () => {
  const [connections] = useAtom(getActiveConnectionsAtom);

  return (
    <SafeAreaView>
      <DefaultHeader pageName="Discover" />
      <ScrollView style={styles.scrollContainer}>
        <PublicChatButton connections={connections} />
        <Spacer />
        <View style={styles.nearbyUsersContainer}>
          <View style={styles.subHeaderContainer}>
            <Text style={theme.textSectionHeader}>Nearby Users</Text>
            {connections.length === 0 && (
              <Text style={[theme.textLarge, styles.noNearbyPeersText]}>
                No other users nearby. Issues? Check that Bluetooth is enabled and another user is
                less than 300ft/100m away.
              </Text>
            )}
          </View>
          {connections.length !== 0 && <NearbyAvatarGrid connections={connections} />}
        </View>

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
    paddingVertical: 5,
  },
  publicChatContainer: {
    height: 95,
    marginHorizontal: 15,
    marginBottom: 18,
    marginTop: 12,
  },
  nearbyUsersContainer: {
    marginTop: 5,
  },
  noNearbyPeersText: {
    marginVertical: 10,
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
