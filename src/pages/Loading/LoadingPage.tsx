import { useAtom } from 'jotai';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { currentUserInfoAtom } from '../../services/atoms';
import { generateRandomName } from '../../utils/RandomName/generateRandomName';

const LoadingPage = () => {
  const [currentUserInfo, setCurrentUserInfo] = useAtom(currentUserInfoAtom);

  // Sets a timeout to start the SDK
  // Also allows use for emulator
  useEffect(() => {
    var timer: any = null;
    timer = setTimeout(() => {
      if (__DEV__ && !currentUserInfo) {
        setCurrentUserInfo({
          bridgefyID: '698E84AE-67EE-4057-87FF-788F88069B68',
          name: generateRandomName(),
          dateCreated: new Date().toISOString(),
        });

        return;
      }
      throw new Error('Timed out on starting SDK');
    }, 10000);

    return () => clearTimeout(timer);
  }, [currentUserInfo, setCurrentUserInfo]);

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
