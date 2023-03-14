import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '@rneui/themed';
import { useAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Linking, StyleSheet, View } from 'react-native';
import { PERMISSIONS, request } from 'react-native-permissions';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';
import PopUp from '../../components/common/PopUp';
import StackHeader from '../../components/common/StackHeader';
import Button from '../../components/ui/Button';
import { currentUserInfoAtom } from '../../services/atoms';
import { theme, vars } from '../../utils/theme';
import { OnboardingStackParamList } from './OnboardingPage';

export default function BluetoothOnboarding() {
  const [currentUserInfo, setCurrentUserInfo] = useAtom(currentUserInfoAtom);
  const [bluetoothError, setBluetoothError] = useState(false);

  const navigation =
    useNavigation<
      NativeStackNavigationProp<OnboardingStackParamList & RootStackParamList, 'Bluetooth'>
    >();

  if (!currentUserInfo) throw new Error('No user info found.');

  useEffect(() => {
    const getBluetoothPermission = async () => {
      //TODO (krishkrosh): android permissions
      const bluetoothRequest = await request(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL);

      if (bluetoothRequest === 'granted') {
        setCurrentUserInfo({
          ...currentUserInfo,
          isOnboarded: true,
        });
        navigation.navigate('Loading');
      } else {
        setBluetoothError(true);
      }
    };
    getBluetoothPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.pageContainer}>
      <View style={styles.headerContainer}>
        <StackHeader title="Bluetooth" />
      </View>

      <View style={styles.contentContainer}>
        <Text style={[theme.textSectionHeaderLarge, styles.title]}>
          To use the app, you'll need Bluetooth enabled.
        </Text>
        <Text style={styles.subscript}>
          Interested in how Bluetooth messaging works?{' '}
          <Text
            style={styles.subscriptLink}
            onPress={() => Linking.openURL('https://internetactivism.org')}
          >
            Learn More
          </Text>
        </Text>
      </View>
      {bluetoothError && (
        <View style={styles.popUpContainer}>
          <PopUp
            title="Something Went Wrong!"
            buttonText="Open Settings"
            onPress={() => Linking.openSettings()}
          >
            You need to enable Bluetooth in Settings
            <Text
              style={styles.popUpLinkText}
              onPress={() => Linking.openURL('https://internetactivism.org')}
            >
              Read more.
            </Text>
          </PopUp>
        </View>
      )}
      <KeyboardAvoidingView behavior="position" style={styles.buttonContainer}>
        <Button
          title="Done!"
          onPress={() => {
            setCurrentUserInfo({
              ...currentUserInfo,
              isOnboarded: true,
            });
            navigation.navigate('Loading');
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    height: '100%',
    width: '100%',
    flex: 1,
  },
  headerContainer: {
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderColor: vars.backgroundColorSecondary,
  },
  contentContainer: {
    marginTop: '10%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  title: {
    textAlign: 'center',
  },
  subscript: {
    marginTop: 10,
    textAlign: 'center',
    marginHorizontal: 20,
    fontFamily: vars.fontFamilyPrimary,
    color: vars.gray.softest,
    fontSize: vars.fontSizeBodyLarge,
    fontWeight: vars.fontWeightRegular,
  },
  subscriptLink: {
    fontFamily: vars.fontFamilyPrimary,
    color: vars.gray.softest,
    fontSize: vars.fontSizeBodyLarge,
    fontWeight: vars.fontWeightRegular,
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    paddingBottom: 20,
    alignSelf: 'center',
  },
  popUpContainer: {
    // put in center of screen
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginTop: 70,
  },
  popUpLinkText: {
    textDecorationLine: 'underline',
  },
});
