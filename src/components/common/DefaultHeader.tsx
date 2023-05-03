import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Text } from '@rneui/themed';
import { useAtom, useAtomValue } from 'jotai';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { bridgefyStatusAtom, currentUserInfoAtom, disableRefreshAtom } from '../../services/atoms';
import { refreshSDK } from '../../services/bridgefy-link';
import { BridgefyStatus } from '../../utils/globals';
import { theme } from '../../utils/theme';
import SettingsIcon from '../ui/Icons/HeaderIcons/SettingsIcon';
import SpinningRefreshIcon from '../ui/Icons/HeaderIcons/SpinningRefreshButton';
import HyperlocalMiniIcon from '../ui/Icons/HyperlocalMiniIcon';

// header that is used for most pages
const DefaultHeader = ({ pageName }: { pageName: string }) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const userInfo = useAtomValue(currentUserInfoAtom);
  const [disableRefresh, setDisableRefresh] = useAtom(disableRefreshAtom);
  const [bridgefyStatus] = useAtom(bridgefyStatusAtom);

  if (!userInfo.userID && bridgefyStatus !== BridgefyStatus.DESTROYED) {
    throw new Error('No user info found.');
  }

  async function refreshApp() {
    setDisableRefresh(true);
    await refreshSDK();
    // Wait 5 seconds before re-enabling the refresh button
    setTimeout(() => {
      setDisableRefresh(false);
    }, 5000);
  }

  const callback = () => {
    if (!disableRefresh) {
      refreshApp();
    }
  };

  return (
    <View style={styles.spaceApart}>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Settings');
          }}
        >
          <HyperlocalMiniIcon />
        </TouchableOpacity>
        <Text style={[styles.text, theme.textPageTitle]}>{pageName}</Text>
      </View>
      {pageName === 'Discover' && (
        <View style={styles.iconsContainer}>
          <SpinningRefreshIcon callback={callback} disabled={disableRefresh} />
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <SettingsIcon />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  spaceApart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 50,
    paddingHorizontal: 20,
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    minHeight: 50,
    paddingHorizontal: 20,
  },
  text: {
    marginTop: 2,
    marginLeft: 10,
  },
});

export default DefaultHeader;
