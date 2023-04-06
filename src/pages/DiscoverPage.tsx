import { Text } from '@rneui/themed';
import { useAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextStyle, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DefaultHeader from '../components/common/DefaultHeader';
import Spacer from '../components/common/Spacer';
import NearbyAvatarGrid from '../components/features/Discover/NearbyAvatarGrid';
import PublicChatButton from '../components/features/PublicChat/PublicChatButton';
import RadarIcon from '../components/ui/Icons/RadarIcon';
import RefreshIconPNG from '../components/ui/Icons/RefreshIconPng';
import { disableRefreshAtom, getActiveConnectionsAtom } from '../services/atoms';
import { refreshSDK } from '../services/bridgefy-link';
import { theme, vars } from '../utils/theme';

interface EllipsisTextProps {
  style?: TextStyle;
}

const EllipsisText: React.FC<EllipsisTextProps> = ({ style }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((val) => {
        if (val.length === 3) {
          return '';
        } else {
          return val + '.';
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <Text style={style}>{dots}</Text>;
};

const DiscoverPage = () => {
  const [connections] = useAtom(getActiveConnectionsAtom);
  const [disableRefresh, setDisableRefresh] = useAtom(disableRefreshAtom);

  async function refreshApp() {
    setDisableRefresh(true);
    await refreshSDK();
    // Wait 5 seconds before re-enabling the refresh button
    setTimeout(() => {
      setDisableRefresh(false);
    }, 5000);
  }

  const styles = getStyles(disableRefresh);

  return (
    <SafeAreaView>
      <DefaultHeader pageName="Discover" />
      <ScrollView style={styles.scrollContainer}>
        <PublicChatButton connections={connections} />
        <Spacer />
        <View style={styles.subHeaderContainer}>
          {connections.length === 0 && (
            <View style={styles.noNearbyPeersContainer}>
              <RadarIcon />
              <View style={styles.noNearbyPeersTextBlock}>
                <Text style={styles.noNearbyPeersHeader}>
                  Scanning for nearby users
                  {disableRefresh ? '...' : <EllipsisText style={styles.noNearbyPeersHeader} />}
                </Text>
                <Text style={styles.noNearbyPeersText}>
                  Looking for other users within 300 feet. Something wrong? {'->'}{' '}
                  <Text
                    style={[styles.noNearbyPeersText, styles.noNearbyPeersLink]}
                    onPress={() => {
                      if (!disableRefresh) {
                        refreshApp();
                      }
                    }}
                    disabled={disableRefresh}
                  >
                    Refresh the app.
                  </Text>
                </Text>
              </View>
            </View>
          )}
          {connections.length !== 0 && (
            <>
              <View style={styles.nearbyPeersHeaderContainer}>
                <Text style={theme.textSectionHeader}>Nearby Users</Text>
                <TouchableOpacity
                  onPress={() => {
                    if (!disableRefresh) {
                      refreshApp();
                    }
                  }}
                  disabled={disableRefresh}
                  style={styles.refreshButton}
                >
                  <RefreshIconPNG />
                </TouchableOpacity>
              </View>
              <NearbyAvatarGrid connections={connections} />
            </>
          )}
        </View>
        <Spacer />
        <View style={styles.alertContainer}>
          <Text style={theme.textSmallMonospace}>REMINDER</Text>
          <Text style={[theme.textSectionHeaderLarge, styles.alertTitle]}>
            Hyperlocal is in alpha!
          </Text>
          <Text style={styles.alertSubscript}>
            Please shake to report any issues you encounter and avoid using in high-risk situations
            until public launch. Anonymized analytics are enabled.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (disableRefresh: boolean) =>
  StyleSheet.create({
    scrollContainer: {
      height: '100%',
    },
    nearbyPeersHeaderContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
    noNearbyPeersHeader: {
      color: vars.gray.text,
      fontFamily: vars.fontFamilySecondary,
      fontSize: 18,
      fontWeight: vars.fontWeightMedium,
    },
    noNearbyPeersContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 5,
      paddingTop: 5,
      paddingHorizontal: 15,
    },
    noNearbyPeersTextBlock: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      // alignItems: 'center',
      marginLeft: 15,
      paddingVertical: 5,
    },
    noNearbyPeersText: {
      paddingVertical: 2.5,
      alignContent: 'center',
      color: vars.gray.soft,
      fontFamily: vars.fontFamilySecondary,
      fontSize: 15,
      fontWeight: vars.fontWeightRegular,
    },
    noNearbyPeersLink: {
      fontWeight: vars.fontWeightMedium,
      textDecorationLine: 'underline',
    },
    alertContainer: {
      marginTop: 15,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      // width: 352,
      marginHorizontal: 25,
      backgroundColor: '#191A19',
      paddingTop: 20,
      paddingBottom: 25,
      borderRadius: 10,
      justifyContent: 'center',
    },
    alertSubscript: {
      color: vars.otherDark.lightGray,
      textAlign: 'center',
      width: 270,
      fontFamily: vars.fontFamilySecondary,
      fontSize: vars.fontSizeDefault,
      fontWeight: vars.fontWeightRegular,
    },
    alertTitle: {
      color: '#B7B7B7',
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 8,
      lineHeight: 28,
      fontFamily: vars.fontFamilyPrimary,
      fontSize: vars.fontSizeSubheadLarge,
      fontWeight: vars.fontWeightRegular,
    },
    refreshButton: { opacity: disableRefresh ? 0.5 : 1 },
    refreshLink: {
      opacity: disableRefresh ? 0.5 : 1,
      padding: 0,
      margin: 0,
      // justifyContent: 'center',
      alignItems: 'baseline',
      // height: '5%',
      position: 'relative',
      // marginBottom: 5,
    },
  });

export default DiscoverPage;
