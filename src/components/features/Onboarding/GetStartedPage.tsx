import { Text } from '@rneui/themed';
import * as React from 'react';
import { Linking, SafeAreaView, StyleSheet, View } from 'react-native';
import { vars } from '../../../utils/theme';
import { Button } from '../../ui';
import LogoIcon from '../../ui/Icons/LogoIcon';

const GetStartedPage = () => {
  return (
    <SafeAreaView style={styles.pageContainer}>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <View style={styles.logoContainer}>
            <LogoIcon width={27} height={27} />
            <Text style={styles.logoText}>Hyperlocal</Text>
          </View>
          <Text style={styles.titleText}>
            Peer
            <Text style={styles.greenText}>-</Text>to
            <Text style={styles.greenText}>-</Text>Peer{'\n'}Bluetooth Messaging
            <Text style={styles.greenText}>.</Text>
          </Text>
          <Text style={styles.subHeaderText}>
            Stay connected to your community, even in emergencies or remote locations. No wifi, no
            problem.
          </Text>
          <Button title="Get Started" style={styles.buttonStyle} />
        </View>
        <View style={styles.bottomDialog}>
          <Text style={styles.bottomDialogText}>
            {'By creating an account you confirm that you are over 13 years old and accept our '}
            <Text
              style={[styles.bottomDialogText, styles.popUpLinkText]}
              //todo: add link to terms and privacy policy
              onPress={() => Linking.openURL('https://internetactivism.org')}
            >
              Terms & Privacy Policy.
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  pageContainer: {},
  container: {
    height: '100%',
    width: '100%',
    flexDirection: 'column',
  },
  textContainer: {
    marginTop: '30%',
    marginLeft: 20,
    marginRight: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    marginLeft: 5,
    color: vars.primaryColor.sharp,
    fontSize: vars.fontSizeHeaderSmall,
    fontFamily: vars.fontFamilyPrimary,
    fontWeight: vars.fontWeightBold,
  },
  titleText: {
    color: vars.white.sharp,
    fontSize: 33,
    fontWeight: vars.fontWeightBold,
    fontFamily: vars.fontFamilySecondary,
    lineHeight: 40,
    marginTop: 10,
  },
  greenText: {
    color: vars.primaryColor.sharp,
  },
  subHeaderText: {
    color: vars.gray.soft,
    fontSize: vars.fontSizeSubhead,
    fontWeight: vars.fontWeightRegular,
    marginTop: 10,
    marginRight: 20,
  },

  buttonStyle: {
    width: '100%',
    marginTop: 15,
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

export default GetStartedPage;
