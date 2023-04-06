import { createStackNavigator } from '@react-navigation/stack';
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

export type OnboardingStackParamListKeys = keyof OnboardingStackParamList;

export function isOnboardingRoute(routeName: string): routeName is keyof OnboardingStackParamList {
  const onboardingRoutes: OnboardingStackParamListKeys[] = [
    'GetStarted',
    'ProfileOnboarding',
    'Bluetooth',
    'AlphaAlertOnboarding',
    'AnalyticsAlertOnboarding',
  ];

  return onboardingRoutes.includes(routeName as OnboardingStackParamListKeys);
}

const OnboardingNavigator = () => {
  const Stack = createStackNavigator<OnboardingStackParamList>();

  return (
    <Stack.Navigator
      initialRouteName="GetStarted"
      screenOptions={{
        headerShown: false,
        cardStyle: {
          backgroundColor: vars.backgroundColor,
        },
        // animation: 'slide_from_right',
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
