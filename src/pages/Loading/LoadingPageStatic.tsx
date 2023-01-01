import { Text } from '@rneui/themed';
import * as React from 'react';
import { Linking, SafeAreaView, StyleSheet, View } from 'react-native';
import LogoIcon from '../../components/ui/Icons/LogoIcon';

const LoadingPageStatic = () => {
  return (
    <SafeAreaView style={styles.pageContainer}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <LogoIcon />
        </View>
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

export default LoadingPageStatic;
