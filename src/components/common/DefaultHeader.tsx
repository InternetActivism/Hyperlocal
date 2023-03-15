import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '@rneui/themed';
import { useAtomValue } from 'jotai';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { currentUserInfoAtom } from '../../services/atoms';
import { theme } from '../../utils/theme';
import ProfilePicture from '../ui/ProfilePicture';

// header that is used for most pages
const DefaultHeader = ({ pageName }: { pageName: string }) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const userInfo = useAtomValue(currentUserInfoAtom);

  if (!userInfo?.userID) {
    throw new Error('No user info found.');
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('Profile');
        }}
      >
        {userInfo?.nickname && (
          <ProfilePicture size="sm" title={userInfo?.nickname} id={userInfo.userID} />
        )}
      </TouchableOpacity>
      <Text style={[styles.text, theme.textPageTitle]}>{pageName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 50,
    paddingHorizontal: 20,
  },
  text: {
    marginLeft: 17,
  },
});

export default DefaultHeader;
