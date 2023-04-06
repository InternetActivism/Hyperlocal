import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Text } from '@rneui/themed';
import { useAtom, useAtomValue } from 'jotai';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { currentUserInfoAtom, disableRefreshAtom } from '../../services/atoms';
import { refreshSDK } from '../../services/bridgefy-link';
import { theme } from '../../utils/theme';
import RefreshIcon from '../ui/Icons/HeaderIcons/RefreshIcon';
import SettingsIcon from '../ui/Icons/HeaderIcons/SettingsIcon';
import HyperlocalMiniIcon from '../ui/Icons/HyperlocalMiniIcon';

// header that is used for most pages
const DefaultHeader = ({ pageName }: { pageName: string }) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const userInfo = useAtomValue(currentUserInfoAtom);
  const [disableRefresh, setDisableRefresh] = useAtom(disableRefreshAtom);

  if (!userInfo.userID) {
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

  return (
    <View style={styles.spaceApart}>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Profile');
          }}
        >
          <HyperlocalMiniIcon />
        </TouchableOpacity>
        <Text style={[styles.text, theme.textPageTitle]}>{pageName}</Text>
      </View>
      {pageName === 'Discover' && (
        <View style={styles.container}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <SettingsIcon />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (!disableRefresh) {
                refreshApp();
              }
            }}
            disabled={disableRefresh}
          >
            <RefreshIcon />
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
  text: {
    marginTop: 2,
    marginLeft: 10,
  },
});

export default DefaultHeader;
