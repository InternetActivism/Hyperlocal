import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '@rneui/themed';
import { useAtomValue } from 'jotai';
import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import ProfilePage from '../../pages/ProfilePage';
import { currentUserInfoAtom } from '../../services/atoms';
import { theme } from '../../utils/theme';
import SettingsIcon from '../ui/Icons/HeaderIcons/SettingsIcon';
import HyperlocalMiniIcon from '../ui/Icons/HyperlocalMiniIcon';

// header that is used for most pages
const DefaultHeader = ({ pageName }: { pageName: string }) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const userInfo = useAtomValue(currentUserInfoAtom);
  const [modalVisible, setModalVisible] = React.useState(false);

  if (!userInfo.userID) {
    throw new Error('No user info found.');
  }

  return (
    <>
      <Modal
        animationType="slide"
        visible={modalVisible}
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <ProfilePage dismiss={() => setModalVisible(false)} />
      </Modal>
      <View style={styles.spaceApart}>
        <View style={styles.container}>
          <TouchableOpacity
            onPress={() => {
              setModalVisible(true);
            }}
          >
            <HyperlocalMiniIcon />
          </TouchableOpacity>
          <Text style={[styles.text, theme.textPageTitle]}>{pageName}</Text>
        </View>
        {pageName === 'Discover' && (
          <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <SettingsIcon height={35} width={35} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
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
