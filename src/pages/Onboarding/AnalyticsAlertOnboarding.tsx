import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '@rneui/themed';
import { useSetAtom } from 'jotai';
import React from 'react';
import { KeyboardAvoidingView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';
import StackHeader from '../../components/common/StackHeader';
import Button from '../../components/ui/Button';
import { currentUserInfoAtom } from '../../services/atoms';
import { theme, vars } from '../../utils/theme';
import { OnboardingStackParamList } from './OnboardingNavigator';

export default function AnalyticsAlertOnboarding() {
  const setCurrentUserInfo = useSetAtom(currentUserInfoAtom);
  const navigation =
    useNavigation<
      NativeStackNavigationProp<
        OnboardingStackParamList & RootStackParamList,
        'AnalyticsAlertOnboarding'
      >
    >();

  return (
    <SafeAreaView style={styles.pageContainer}>
      <View style={styles.headerContainer}>
        <StackHeader title="Analytics" />
      </View>

      <View style={styles.contentContainer}>
        <Text style={[theme.textSectionHeaderLarge, styles.title]}>
          In order to fix bugs, we’ve temporarily integrated anonymized analytics.
        </Text>
        <Text style={styles.subscript}>
          This usage data helps us discover and understand issues that might be occurring. This is
          required to be an early-access user.
        </Text>
      </View>

      <View style={styles.alertBlock}>
        <View style={styles.alertContainer}>
          <Text style={theme.textSmallMonospace}>I UNDERSTAND THAT</Text>
          <Text style={[theme.textSectionHeaderLarge, styles.alertTitle]}>
            Hyperlocal will report {'\n'}anonymous usage data.
          </Text>
          <Text style={styles.alertSubscript}>
            All early users provide anonymous data on usage and Bluetooth connections. For this
            reason, we suggest users do not use the app in high-risk situations.
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior="position" style={styles.buttonContainer}>
        <Button
          title="Allow analytics sharing"
          onPress={() => {
            navigation.navigate('Loading');
            setCurrentUserInfo((prev) => {
              if (!prev) {
                throw new Error('No user info found.');
              }
              return {
                ...prev,
                isOnboarded: true,
              };
            });
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  subscript: {
    marginTop: 10,
    textAlign: 'center',
    marginHorizontal: 20,
    fontFamily: vars.fontFamilyPrimary,
    color: vars.gray.softest,
    fontSize: vars.fontSizeBodyLarge,
    fontWeight: vars.fontWeightRegular,
    width: 300,
  },
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
