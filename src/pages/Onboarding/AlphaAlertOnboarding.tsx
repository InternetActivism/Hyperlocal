import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Text } from '@rneui/themed';
import React from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StackHeader from '../../components/common/StackHeader';
import Button from '../../components/ui/Button';
import { theme, vars } from '../../utils/theme';
import { OnboardingStackParamList } from './OnboardingNavigator';

export default function AlphaAlertOnboarding() {
  const navigation =
    useNavigation<StackNavigationProp<OnboardingStackParamList, 'AlphaAlertOnboarding'>>();

  return (
    <SafeAreaView style={styles.pageContainer}>
      <View style={styles.headerContainer}>
        <StackHeader title="Alpha Alert" />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Text style={[theme.textSectionHeader, styles.title]}>
            You are using a pre-release version of Hyperlocal!
          </Text>
        </View>

        <View style={styles.alertBlock}>
          <View style={styles.alertContainer}>
            <Text style={theme.textSmallMonospace}>I UNDERSTAND THAT</Text>
            <Text style={[theme.textSectionHeaderLarge, styles.alertTitle]}>
              Hyperlocal is not yet {'\n'} security audited.
            </Text>
            <Text style={styles.alertSubscript}>
              We strongly recommend against using Hyperlocal in high-risk environments, since there
              may be unpatched security vulnerabilities.
            </Text>
          </View>

          <View style={styles.alertContainer}>
            <Text style={theme.textSmallMonospace}>I UNDERSTAND THAT</Text>
            <Text style={[theme.textSectionHeaderLarge, styles.alertTitle]}>
              Hyperlocal is still in early {'\n'} phases of development.
            </Text>
            <Text style={styles.alertSubscript}>
              The app may crash, restart, or otherwise malfunction. If you see this, shake your
              phone to open up the bug report menu.
            </Text>
          </View>
        </View>
      </ScrollView>

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
    fontSize: vars.fontSizeHeaderSmall,
    fontWeight: vars.fontWeightRegular,
    color: '#DBDCDB',
    width: 300,
  },
  alertBlock: {
    marginTop: 20,
    flexDirection: 'column',
    alignItems: 'center',
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
  },
  alertContainer: {
    marginTop: 30,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 352,
    backgroundColor: '#191A19',
    paddingTop: 20,
    paddingBottom: 25,
    borderRadius: 10,
    justifyContent: 'center',
  },
  alertSubscript: {
    color: vars.otherDark.lightGray,
    textAlign: 'center',
    width: 270,
    fontFamily: vars.fontFamilySecondary,
    fontSize: vars.fontSizeDefault,
    fontWeight: vars.fontWeightRegular,
  },
  alertTitle: {
    color: vars.gray.text,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
    lineHeight: 28,
    fontFamily: vars.fontFamilyPrimary,
    fontSize: vars.fontSizeSubheadLarge,
    fontWeight: vars.fontWeightRegular,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    paddingBottom: 20,
    alignSelf: 'center',
  },
});
