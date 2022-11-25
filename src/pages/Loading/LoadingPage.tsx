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

  useEffect(() => {
    if (__DEV__) {
      setCurrentUserInfo({
        bridgefyID: '698E84AE-67EE-4057-87FF-788F88069B68',
        name: generateRandomName(),
        dateCreated: new Date().toISOString(),
      });

      return;
    }
  }, []);

  useEffect(() => {
    var timer: any = null;
    if (currentUserInfo) {
      timer = setTimeout(() => {
        throw new Error('Timed out on starting SDK');
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [currentUserInfo]);

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
