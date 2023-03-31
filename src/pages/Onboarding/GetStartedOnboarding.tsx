import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '@rneui/themed';
import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/ui/Button';
import LogoIcon from '../../components/ui/Icons/LogoIcon';
import { vars } from '../../utils/theme';
import { OnboardingStackParamList } from './OnboardingNavigator';

const GetStartedOnboarding = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<OnboardingStackParamList, 'GetStarted'>>();

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
          <Button
            title="Get Started"
            style={styles.buttonStyle}
            onPress={() => navigation.navigate('ProfileOnboarding')}
          />
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
    marginTop: '40%',
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
    fontWeight: vars.fontWeightSemibold,
  },
  titleText: {
    color: vars.white.sharp,
    fontSize: 33,
    fontWeight: vars.fontWeightSemibold,
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
    color: vars.gray.softest,
    paddingHorizontal: 25,
    fontSize: 14,
  },
});

export default GetStartedOnboarding;
