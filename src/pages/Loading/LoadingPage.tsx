import { Button, Text } from '@rneui/themed';
import { useAtom, useAtomValue } from 'jotai';
import * as React from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { Linking } from 'react-native';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import LogoIcon from '../../components/ui/Icons/LogoIcon';
import {
  bridgefyStatusAtom,
  activeConnectionsAtom,
  currentUserInfoAtom,
} from '../../services/atoms';
import { getOrCreateUserInfoDatabase, setUserInfoDatabase } from '../../services/user';
import { BridgefyStates } from '../../utils/globals';

interface PopUpData {
  message: string;
  buttonText: string;
  buttonAction: () => void;
}

// Default pop-up data for unknown error states
const defaultPopUpData: PopUpData = {
  message: 'There’s an issue with the mesh-network, try restarting. ',
  buttonText: 'Restart the App',
  // TODO: Implement restart app functionality
  buttonAction: () => {},
};

// List of Bridgefy states that are considered errors
const errorStates: number[] = [
  BridgefyStates.FAILED,
  BridgefyStates.BLUETOOTH_OFF,
  BridgefyStates.BLUETOOTH_PERMISSION_REJECTED,
  BridgefyStates.REQUIRES_WIFI,
];

const openAppSettings: () => void = async () => {
  await Linking.openSettings();
};

// Information to display in the pop-up for each error state
const popUpInfo = new Map<number, PopUpData>([
  [
    BridgefyStates.BLUETOOTH_OFF,
    {
      message: 'Your phone has Bluetooth off, which you can enable in Settings. ',
      buttonText: 'Enable Bluetooth',
      buttonAction: openAppSettings,
    },
  ],
  [
    BridgefyStates.BLUETOOTH_PERMISSION_REJECTED,
    {
      message: 'The bluetooth permission has been rejected, you can allow it in Settings. ',
      buttonText: 'Allow Bluetooth',
      buttonAction: openAppSettings,
    },
  ],
  [
    BridgefyStates.REQUIRES_WIFI,
    {
      message:
        'Since it’s the first time you’ve opened the app in a while, you’ll need to setup a few things. ',
      buttonText: 'Connect to Internet',
      buttonAction: openAppSettings,
    },
  ],
]);

const LoadingPage = ({ navigation }) => {
  const bridgefyStatus = useAtomValue(bridgefyStatusAtom);
  const [minTimeoutReached, setMinTimeoutReached] = useState<boolean>(false);
  const [currentUserInfo, setCurrentUserInfo] = useAtom(currentUserInfoAtom);
  const [, setConnections] = useAtom(activeConnectionsAtom);

  // Get the pop-up data for the current Bridgefy state
  const popUp: PopUpData = popUpInfo.get(bridgefyStatus) || defaultPopUpData;

  const simulatorTimer: any = useRef();

  // Navigate to home when Bridgefy is ready and minimum timeout has been reached
  useEffect(() => {
    if (currentUserInfo !== null && minTimeoutReached) {
      clearTimeout(simulatorTimer.current);
      navigation.navigate('Home');
    }
  }, [currentUserInfo, minTimeoutReached, navigation]);

  useEffect(() => {
    // Set up a minimum timeout so that the loading screen is shown for at least 1 second
    setTimeout(() => {
      setMinTimeoutReached(true);
    }, 1000);

    // Sets up a timeout to start the SDK. Allows us to run the app in a simulator.
    simulatorTimer.current = setTimeout(() => {
      if (__DEV__) {
        console.log('(LoadingPage) running in dev mode');
      }
      if (__DEV__ && !currentUserInfo) {
        console.log('(LoadingPage) loading dummy user info');
        const newUser = getOrCreateUserInfoDatabase('698E84AE-67EE-4057-87FF-788F88069B68', false);
        setUserInfoDatabase(newUser);
        setCurrentUserInfo(newUser);
        setConnections([
          '55507E96-B4A2-404F-8A37-6A3898E3EC2B',
          '93f45b0a-be57-453a-9065-86320dda99db',
        ]);

        return;
      }
    }, 10000);

    return () => {
      clearTimeout(simulatorTimer.current);
    };
  }, [currentUserInfo, setCurrentUserInfo, setConnections]);

  return (
    <SafeAreaView style={styles.pageContainer}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <LogoIcon />
        </View>
        {errorStates.includes(bridgefyStatus) ? (
          <View style={styles.popUpContainer}>
            <View style={styles.popUp}>
              <Text style={styles.popUpTitleText}>What's wrong?</Text>
              <Text style={styles.popUpDescriptionText}>
                {popUp.message}
                <Text
                  style={[styles.popUpDescriptionText, styles.popUpLinkText]}
                  onPress={() => Linking.openURL('https://internetactivism.org')}
                >
                  Read more.
                </Text>
              </Text>
              <Button
                title={popUp.buttonText}
                buttonStyle={styles.popUpButton}
                titleStyle={styles.popUpButtonTitle}
                onPress={popUp.buttonAction}
              />
            </View>
          </View>
        ) : (
          <View style={styles.bottomDialog}>
            <Text style={styles.bottomDialogText}>
              {
                'A project by InternetActivism, a 501(c)(3) organization, in partnership with Bridgefy. '
              }
              <Text
                style={[styles.bottomDialogText, styles.popUpLinkText]}
                onPress={() => Linking.openURL('https://internetactivism.org')}
              >
                Read more.
              </Text>
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    backgroundColor: '#111311',
  },
  container: {
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#111311',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: '65%',
  },
  popUpContainer: {
    paddingHorizontal: 25,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  popUp: {
    width: '100%',
    backgroundColor: '#171917',
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#303230',
    padding: 20,
    alignItems: 'center',
  },
  popUpTitleText: {
    fontSize: 20,
    fontFamily: 'Rubik-Medium',
    fontWeight: '500',
    color: '#FFFFFF',
    paddingBottom: 8,
  },
  popUpDescriptionText: {
    fontSize: 15,
    fontFamily: 'Rubik-Regular',
    fontWeight: '400',
    color: '#939893',
    textAlign: 'center',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  popUpLinkText: {
    textDecorationLine: 'underline',
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
  bottomDialog: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  bottomDialogText: {
    textAlign: 'center',
    color: '#7B7B7B',
    paddingHorizontal: 25,
    fontSize: 14,
  },
});

export default LoadingPage;
