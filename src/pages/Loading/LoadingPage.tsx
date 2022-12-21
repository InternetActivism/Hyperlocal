import { useAtom } from 'jotai';
import React, { useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';
import { currentUserInfoAtom } from '../../services/atoms';
import { generateRandomName } from '../../utils/RandomName/generateRandomName';
// import BluetoothStateManager from 'react-native-bluetooth-state-manager';

const LoadingPage = () => {
  const [userInfo, setUserInfo] = useAtom(currentUserInfoAtom);

  // const isBluetoothEnabled = async () => {
  //   const state = await BluetoothStateManager.getState();
  //   console.log('Bluetooth state: ', state);
  //   if (state === 'PoweredOn') {
  //     console.log('Bluetooth is enabled');
  //   } else {
  //     console.log('Bluetooth is disabled');
  //   }
  // };

  /* Sets up a timeout to start the SDK. Allows us to run the app in a simulator. */
  useEffect(() => {
    var timer: any = null;
    timer = setTimeout(() => {
      if (__DEV__) {
        console.log('running in dev mode');
      }
      if (__DEV__ && !userInfo) {
        setUserInfo({
          userID: '698E84AE-67EE-4057-87FF-788F88069B68',
          nickname: generateRandomName(),
          userFlags: 0,
          privacy: 0, // used in future versions
          verified: false, // used in future versions
          dateCreated: Date.now(),
          dateUpdated: Date.now(),
        });

        return;
      }
      throw Error('Error on loading user info.');
    }, 10000);

    return () => clearTimeout(timer);
  }, [userInfo, setUserInfo]);

  /*

    Checks are first start (check via user_info), Bluetooth, SDK ready.

  */
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default LoadingPage;
