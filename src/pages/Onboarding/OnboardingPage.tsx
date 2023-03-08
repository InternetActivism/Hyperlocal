import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { vars } from '../../utils/theme';
import BluetoothOnboarding from './BluetoothOnboarding';
import GetStartedOnboarding from './GetStartedOnboarding';
import ProfileOnboarding from './ProfileOnboarding';

export type OnboardingStackParamList = {
  GetStarted: undefined;
  ProfileOnboarding: undefined;
  Bluetooth: undefined;
};

const OnboardingPage = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      initialRouteName="Get Started Onboarding"
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
    </Stack.Navigator>
  );
};

export default OnboardingPage;
