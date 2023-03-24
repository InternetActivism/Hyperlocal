import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button as RneuiButton, Text } from '@rneui/themed';
import { useSetAtom } from 'jotai';
import React, { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Linking, StyleSheet, View } from 'react-native';
import { check, PERMISSIONS, request } from 'react-native-permissions';
import { SafeAreaView } from 'react-native-safe-area-context';
import PopUp from '../../components/common/PopUp';
import StackHeader from '../../components/common/StackHeader';
import Button from '../../components/ui/Button';
import { currentUserInfoAtom } from '../../services/atoms';
import { theme, vars } from '../../utils/theme';
import { OnboardingStackParamList } from './OnboardingNavigator';

export default function BluetoothOnboarding() {
  const setCurrentUserInfo = useSetAtom(currentUserInfoAtom);
  const [bluetoothError, setBluetoothError] = useState(false);

  const navigation =
    useNavigation<NativeStackNavigationProp<OnboardingStackParamList, 'Bluetooth'>>();

  const onBluetoothGranted = useCallback(() => {
    setCurrentUserInfo((prev) => {
      if (!prev) {
        throw new Error('No user info found.');
      }
      return {
        ...prev,
        isOnboarded: true,
      };
    });
    navigation.navigate('AlphaAlertOnboarding');
  }, [setCurrentUserInfo, navigation]);

  useEffect(() => {
    const checkBluetooth = async () => {
      const bluetoothCheck = await check(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL);
      if (bluetoothCheck === 'granted') {
        onBluetoothGranted();
      }
    };
    checkBluetooth();
  }, [onBluetoothGranted]);

  const requestBluetooth = async () => {
    //TODO (krishkrosh): android permissions
    const bluetoothRequest = await request(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL);

    if (bluetoothRequest === 'granted') {
      onBluetoothGranted();
    } else {
      setBluetoothError(true);
    }
  };

  const FakePermissions = () => {
    return (
      <View style={styles.permissions}>
        <Text style={styles.permissionsText}>"Hyperlocal" Would Like to Use Bluetooth</Text>
        <Text style={styles.permissionsDescription}>
          This app won't work without Bluetooth, which is used to send messages to people around
          you.
        </Text>
        <View style={styles.buttonsRow}>
          <View style={styles.permissionButtonWrapper}>
            <RneuiButton
              disabledStyle={styles.leftPermission}
              disabledTitleStyle={styles.leftPermissionTitle}
              disabled={true}
            >
              Don't Allow
            </RneuiButton>
          </View>
          <View style={styles.permissionButtonWrapper}>
            <RneuiButton
              buttonStyle={styles.rightPermission}
              titleStyle={styles.rightPermissionTitle}
              onPress={requestBluetooth}
            >
              Allow
            </RneuiButton>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.pageContainer}>
      <View style={styles.headerContainer}>
        <StackHeader title="Bluetooth" />
      </View>

      <View style={styles.contentContainer}>
        <Text style={[theme.textSectionHeader, styles.title]}>
          To use the app, you'll need Bluetooth enabled.
        </Text>
        <Text style={styles.subscript}>
          Interested in how Bluetooth messaging works?{' '}
          {/* <Text
            style={styles.subscriptLink}
            onPress={() => Linking.openURL('https://internetactivism.org')}
          >
            Learn More
          </Text> */}
        </Text>
      </View>

      {bluetoothError ? (
        <View style={styles.popUpContainer}>
          <PopUp
            title="Something Went Wrong!"
            buttonText="Open Settings"
            onPress={() => Linking.openSettings()}
          >
            You need to enable Bluetooth in Settings.{' '}
            <Text
              style={styles.popUpLinkText}
              onPress={() => Linking.openURL('https://internetactivism.org')}
            >
              Read more.
            </Text>
          </PopUp>
        </View>
      ) : (
        <View style={styles.permissionsContainer}>
          <FakePermissions />
        </View>
      )}
      <KeyboardAvoidingView behavior="position" style={styles.buttonContainer}>
        {/* Dummy button to fit rest of the onboarding pages */}
        <Button title="Done!" disabled={true} />
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
    fontFamily: vars.fontFamilyPrimary,
    fontSize: vars.fontSizeHeaderSmall,
    fontWeight: vars.fontWeightRegular,
    color: '#DBDCDB',
    width: 300,
  },
  subscript: {
    marginTop: 10,
    textAlign: 'center',
    marginHorizontal: 20,
    fontFamily: vars.fontFamilyPrimary,
    color: vars.gray.softest,
    fontSize: vars.fontSizeBodyLarge,
    fontWeight: vars.fontWeightRegular,
    width: 300,
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
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginTop: 70,
  },
  popUpLinkText: {
    textDecorationLine: 'underline',
    color: '#939893',
  },

  permissionsContainer: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 50,
  },
  permissions: {
    width: '100%',
    backgroundColor: '#171917',
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#303230',
    paddingTop: 20,
    alignItems: 'center',
  },
  permissionsText: {
    fontSize: 20,
    fontFamily: 'Rubik-Medium',
    fontWeight: '400',
    color: vars.white.sharp,
    textAlign: 'center',
    paddingBottom: 8,
    paddingHorizontal: 30,
  },
  permissionsDescription: {
    fontSize: 15,
    fontFamily: 'Rubik-Regular',
    fontWeight: '400',
    color: '#939893',
    textAlign: 'center',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  popUpButton: {
    width: 290,
    height: 50,
    backgroundColor: '#193C2A',
    borderRadius: 32,
  },
  popUpButtonTitle: {
    fontSize: 20,
    fontFamily: 'Rubik-Medium',
    fontWeight: '500',
    color: '#1DDE2D',
  },
  buttonsRow: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: 2,
    borderColor: '#303230',
  },
  leftPermission: {
    height: 50,
    borderColor: '#303230',
    borderRightWidth: 2,
    backgroundColor: 'transparent',
  },
  rightPermission: {
    height: 50,
    borderColor: '#303230',
    backgroundColor: 'transparent',
  },
  rightPermissionTitle: {
    color: vars.green.text,
    fontSize: vars.fontSizeBodyLarge,
    fontWeight: vars.fontWeightBold,
    fontFamily: vars.fontFamilySecondary,
  },
  leftPermissionTitle: {
    fontSize: vars.fontSizeBodyLarge,
    fontWeight: vars.fontWeightRegular,
    fontFamily: vars.fontFamilySecondary,
  },
  permissionButtonWrapper: {
    width: '50%',
  },
});
