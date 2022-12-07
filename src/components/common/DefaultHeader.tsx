import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '@rneui/themed';
import { useAtomValue } from 'jotai';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ProfilePicture } from '../ui';
import { currentUserInfoAtom } from '../../services/atoms';

// header that is used for most pages
const DefaultHeader = ({ pageName }: { pageName: string }) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const currentUserInfo = useAtomValue(currentUserInfoAtom);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('Profile');
        }}>
        {currentUserInfo?.name && (
          <ProfilePicture size="sm" title={currentUserInfo?.name} />
        )}
      </TouchableOpacity>
      <Text style={styles.text}>{pageName}</Text>
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
    fontSize: 26,
    fontFamily: 'Rubik-Medium',
    marginLeft: 17,
  },
});

export default DefaultHeader;
