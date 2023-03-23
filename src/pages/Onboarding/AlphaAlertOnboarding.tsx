import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '@rneui/themed';
import React from 'react';
import { KeyboardAvoidingView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StackHeader from '../../components/common/StackHeader';
import Button from '../../components/ui/Button';
import { theme, vars } from '../../utils/theme';
import { OnboardingStackParamList } from './OnboardingNavigator';

export default function AlphaAlertOnboarding() {
  const navigation =
    useNavigation<NativeStackNavigationProp<OnboardingStackParamList, 'AlphaAlertOnboarding'>>();

  return (
    <SafeAreaView style={styles.pageContainer}>
      <View style={styles.headerContainer}>
        <StackHeader title="Alpha Alert" />
      </View>

      <View style={styles.contentContainer}>
        <Text style={[theme.textSectionHeaderLarge, styles.title]}>
          You are using a pre-release version of Hyperlocal!
        </Text>
      </View>

      <View style={styles.alertBlock}>
        <View style={styles.alertContainer}>
          <Text style={[theme.textSmallMonospace, styles.alertHeader]}>I UNDERSTAND THAT</Text>
          <Text style={[theme.textSectionHeaderLarge, styles.alertTitle]}>
            Hyperlocal is not yet {'\n'} security audited.
          </Text>
          <Text style={styles.alertSubscript}>
            We strongly recommend against using Hyperlocal in high-risk environments, since there
            may be unpatched security vulnerabilities.
          </Text>
        </View>

        <View style={styles.alertContainer}>
          <Text style={[theme.textSmallMonospace, styles.alertHeader]}>I UNDERSTAND THAT</Text>
          <Text style={[theme.textSectionHeaderLarge, styles.alertTitle]}>
            Hyperlocal is still in early {'\n'} phases of development.
          </Text>
          <Text style={styles.alertSubscript}>
            The app may crash, restart, or otherwise malfunction. If you see this, shake your phone
            to open up the bug report menu.
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior="position" style={styles.buttonContainer}>
        <Button
          title="I understand"
          onPress={() => {
            navigation.navigate('AnalyticsAlertOnboarding');
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    fontFamily: vars.fontFamilyPrimary,
    fontSize: vars.fontSizeHeader,
    fontWeight: vars.fontWeightRegular,
    color: '#DBDCDB',
    marginHorizontal: 40,
  },
  alertHeader: {
    textAlign: 'center',
  },
  alertBlock: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertContainer: {
    marginTop: 20,
    display: 'flex',
    width: 352,
    backgroundColor: '#191A19',
    textAlign: 'center',
    paddingVertical: 20,
    borderRadius: 10,
  },
  pageContainer: {
    height: '100%',
    width: '100%',
    flex: 1,
  },
  headerContainer: {
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderColor: vars.backgroundColorSecondary,
  },
  contentContainer: {
    marginTop: '15%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  alertSubscript: {
    color: '#7E837E',
    textAlign: 'center',
    marginHorizontal: 40,
    fontFamily: vars.fontFamilySecondary,
    fontSize: vars.fontSizeBodyLarge,
    fontWeight: vars.fontWeightRegular,
  },
  alertTitle: {
    color: '#C9C9C9',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
    lineHeight: 28,
    fontFamily: vars.fontFamilyPrimary,
    fontSize: vars.fontSizeHeaderSmall,
    fontWeight: vars.fontWeightRegular,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    paddingBottom: 20,
    alignSelf: 'center',
  },
});
