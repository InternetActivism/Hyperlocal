import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { vars } from '../../utils/theme';
import BluetoothOnboarding from './BluetoothOnboarding';
import GetStartedOnboarding from './GetStartedOnboarding';
import ProfileOnboarding from './ProfileOnboarding';

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
      <Stack.Screen name="Get Started Onboarding" component={GetStartedOnboarding} />
      <Stack.Screen name="Profile Onboarding" component={ProfileOnboarding} />
      <Stack.Screen name="Bluetooth Onboarding" component={BluetoothOnboarding} />
    </Stack.Navigator>
  );
};

export default OnboardingPage;
