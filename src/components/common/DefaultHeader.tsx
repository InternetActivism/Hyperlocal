import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StackNavigationProp } from '@react-navigation/stack';
import { Text } from '@rneui/themed';
import { useAtomValue } from 'jotai';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { currentUserInfoAtom } from '../../services/atoms';
import { theme } from '../../utils/theme';
import SettingsIcon from '../ui/Icons/HeaderIcons/SettingsIcon';
import HyperlocalMiniIcon from '../ui/Icons/HyperlocalMiniIcon';

// header that is used for most pages
const DefaultHeader = ({ pageName }: { pageName: string }) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const userInfo = useAtomValue(currentUserInfoAtom);

  if (!userInfo.userID) {
    throw new Error('No user info found.');
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
