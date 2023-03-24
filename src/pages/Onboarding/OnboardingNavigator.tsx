import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { vars } from '../../utils/theme';
import AlphaAlertOnboarding from './AlphaAlertOnboarding';
import AnalyticsAlertOnboarding from './AnalyticsAlertOnboarding';
import BluetoothOnboarding from './BluetoothOnboarding';
import GetStartedOnboarding from './GetStartedOnboarding';
import ProfileOnboarding from './ProfileOnboarding';

export type OnboardingStackParamList = {
  GetStarted: undefined;
  ProfileOnboarding: undefined;
  Bluetooth: undefined;
  AlphaAlertOnboarding: undefined;
  AnalyticsAlertOnboarding: undefined;
};

const OnboardingNavigator = () => {
  const Stack = createNativeStackNavigator<OnboardingStackParamList>();

  return (
    <Stack.Navigator
      initialRouteName="GetStarted"
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: vars.backgroundColor,
        },
      }}
    >
      <Stack.Screen name="GetStarted" component={GetStartedOnboarding} />
      <Stack.Screen name="ProfileOnboarding" component={ProfileOnboarding} />
      <Stack.Screen name="Bluetooth" component={BluetoothOnboarding} />
      <Stack.Screen name="AlphaAlertOnboarding" component={AlphaAlertOnboarding} />
      <Stack.Screen name="AnalyticsAlertOnboarding" component={AnalyticsAlertOnboarding} />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;
