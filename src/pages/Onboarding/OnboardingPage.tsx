import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import GetStartedPage from '../../components/features/Onboarding/GetStartedPage';
import { vars } from '../../utils/theme';

const OnboardingPage = () => {
  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Get Started"
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: vars.backgroundColor,
          },
        }}
      >
        <Stack.Screen name="Get Started" component={GetStartedPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default OnboardingPage;
