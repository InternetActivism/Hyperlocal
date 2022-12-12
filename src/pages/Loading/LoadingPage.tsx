import { useAtom } from 'jotai';
import React, { useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';
import { currentUserInfoAtom } from '../../services/atoms';
import { generateRandomName } from '../../utils/RandomName/generateRandomName';

const LoadingPage = () => {
  const [userInfo, setUserInfo] = useAtom(currentUserInfoAtom);

  // Sets a timeout to start the SDK
  // Also allows use for emulator
  useEffect(() => {
    var timer: any = null;
    timer = setTimeout(() => {
      if (__DEV__ && !userInfo) {
        setUserInfo({
          userID: '698E84AE-67EE-4057-87FF-788F88069B68',
          username: '', // used in future versions, globally unique
          nickname: generateRandomName(),
          userFlags: 0,
          privacy: 0, // used in future versions
          verified: false, // used in future versions
          dateCreated: Date.now(),
          dateUpdated: Date.now(),
        });

        return;
      }
      throw new Error('Timed out on starting SDK');
    }, 10000);

    return () => clearTimeout(timer);
  }, [userInfo, setUserInfo]);

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
