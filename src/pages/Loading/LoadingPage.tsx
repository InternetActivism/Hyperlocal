import React from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';

// import BluetoothStateManager from 'react-native-bluetooth-state-manager';

const LoadingPage = () => {
  // const isBluetoothEnabled = async () => {
  //   const state = await BluetoothStateManager.getState();
  //   console.log('Bluetooth state: ', state);
  //   if (state === 'PoweredOn') {
  //     console.log('Bluetooth is enabled');
  //   } else {
  //     console.log('Bluetooth is disabled');
  //   }
  // };

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
