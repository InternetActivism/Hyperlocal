import { useNavigation } from '@react-navigation/core';

import { StackNavigationProp } from '@react-navigation/stack';
import { Text } from '@rneui/themed';
import { useAtomValue } from 'jotai';
import React, { useEffect, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { Bar as ProgressBar } from 'react-native-progress';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../App';
import PopUp from '../components/common/PopUp';
import LogoIcon from '../components/ui/Icons/LogoIcon';
import { bridgefyStatusAtom, currentUserInfoAtom } from '../services/atoms';
import { startSDK, stopSDK } from '../services/bridgefy-link';
import { BridgefyErrorStates, BridgefyStates } from '../utils/globals';
import getRandomValue from '../utils/randomValue';
import { vars } from '../utils/theme';

interface PopUpData {
  message: string;
  buttonText: string;
  buttonAction: () => void;
}

// Default pop-up data for unknown error states
const defaultPopUpData: PopUpData = {
  message:
    'There’s an issue with the Bluetooth mesh-network, try restarting the app or clicking below.',
  buttonText: 'Restart the SDK',
  // TODO: Implement restart app functionality
  buttonAction: () => {
    stopSDK()
      .catch((e) => {
        console.warn(e);
        return;
      })
      .then(() => {
        startSDK().catch((e) => {
          console.warn(e);
          return;
        });
      });
  },
};

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

const LoadingPage = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Loading'>>();
  const bridgefyStatus = useAtomValue(bridgefyStatusAtom);
  const [minTimeoutReached, setMinTimeoutReached] = useState<boolean>(false);
  const currentUserInfo = useAtomValue(currentUserInfoAtom);
  const [progress, setProgress] = useState<number>(0);
  const [paused, setPaused] = useState<boolean>(false);
  const [errorCode, setErrorCode] = useState<number>(0);

  // Get the pop-up data for the current Bridgefy state
  const popUp: PopUpData = popUpInfo.get(bridgefyStatus) || defaultPopUpData;

  // Navigate to home/onboarding when minimum timeout has been reached
  useEffect(() => {
    if (currentUserInfo && !currentUserInfo.isOnboarded && minTimeoutReached && !paused) {
      setProgress(1);
      setTimeout(
        () =>
          navigation.reset({
            index: 0,
            routes: [{ name: 'Onboarding' }],
          }),
        200
      );
      return;
    }

    if (
      currentUserInfo &&
      currentUserInfo.isOnboarded &&
      minTimeoutReached &&
      !paused &&
      currentUserInfo.userID
    ) {
      setProgress(1);
      setTimeout(
        () =>
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          }),
        200
      );
      return;
    }
  }, [currentUserInfo, minTimeoutReached, navigation, paused]);

  useEffect(() => {
    // Set up a minimum timeout so that the loading screen is shown for at least 1 second
    setTimeout(() => {
      setMinTimeoutReached(true);
    }, 1500);

    // Configure fake delays for the progress bar
    const delays: [number, number][] = [
      [0.25, getRandomValue(150, 400)],
      [0.5, getRandomValue(500, 900)],
      [0.75, getRandomValue(1000, 1300)],
    ];

    // Run fake delays
    delays.forEach((delay) => {
      setTimeout(() => setProgress(delay[0]), delay[1]);
    });
  }, []);

  // Pause the progress bar when there's an error
  useEffect(() => {
    if (BridgefyErrorStates.includes(bridgefyStatus)) {
      setErrorCode(bridgefyStatus);
    }

    if (!paused && BridgefyErrorStates.includes(bridgefyStatus)) {
      setPaused(true);
    } else if (
      paused &&
      !(BridgefyErrorStates.includes(bridgefyStatus) || bridgefyStatus === BridgefyStates.OFFLINE)
    ) {
      setPaused(false);
    }
  }, [bridgefyStatus, minTimeoutReached, paused]);

  return (
    <SafeAreaView style={styles.pageContainer}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <LogoIcon />
          <ProgressBar
            progress={progress}
            width={155}
            height={5}
            color={paused ? vars.red.sharp : vars.green.soft}
            unfilledColor={vars.black.soft}
            borderWidth={0}
            animated={true}
            style={styles.progressBar}
          />
        </View>
        {paused ? (
          <View style={styles.popUpContainer}>
            <PopUp title="What's wrong?" buttonText={popUp.buttonText} onPress={popUp.buttonAction}>
              {`${popUp.message} Error code: ${errorCode}`}
              {/* <Text
                style={styles.popUpLinkText}
                onPress={() => Linking.openURL('https://internetactivism.org')}
              >
                Read more.
              </Text> */}
            </PopUp>
          </View>
        ) : (
          <View style={styles.bottomDialog}>
            <Text style={styles.bottomDialogText}>
              {
                'A project by InternetActivism, a 501(c)(3) organization, in partnership with Bridgefy. '
              }
              {/* <Text
                style={[styles.bottomDialogText, styles.popUpLinkText]}
                onPress={() => Linking.openURL('https://internetactivism.org')}
              >
                Read more.
              </Text> */}
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
    marginTop: '50%',
  },
  progressBar: {
    marginTop: 20,
  },
  popUpContainer: {
    paddingHorizontal: 25,
    position: 'absolute',
    bottom: 25,
    width: '100%',
  },
  popUpLinkText: {
    textDecorationLine: 'underline',
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
