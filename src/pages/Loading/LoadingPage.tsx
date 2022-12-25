import { useAtom } from 'jotai';
import React, { useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';
import { currentUserInfoAtom } from '../../services/atoms';
import { getOrCreateUserInfoDatabase, setUserInfoDatabase } from '../../services/user';
// import BluetoothStateManager from 'react-native-bluetooth-state-manager';

const LoadingPage = () => {
  const [currentUserInfo, setCurrentUserInfo] = useAtom(currentUserInfoAtom);

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
        console.log('(LoadingPage) running in dev mode');
      }
      if (__DEV__ && !currentUserInfo) {
        console.log('loading dummy user info');
        const newUser = getOrCreateUserInfoDatabase('698E84AE-67EE-4057-87FF-788F88069B68', false);
        setUserInfoDatabase(newUser);
        setCurrentUserInfo(newUser);
        return;
      }
      throw Error('Error on loading user info.');
    }, 10000);

    return () => clearTimeout(timer);
  }, [currentUserInfo, setCurrentUserInfo]);

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
