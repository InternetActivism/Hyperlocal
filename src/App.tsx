import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { LoadingPage, OnboardingPage, ProfilePage } from './pages';
import { ChatPage } from './pages/Chat';
import TabNavigator from './pages/TabNavigator/TabNavigator';
import { vars } from './utils/theme';

/* App handles all functionality before starting the bridgefy SDK */
export default function App() {
  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Loading"
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: vars.backgroundColor,
          },
        }}
      >
        <Stack.Screen name="Loading" component={LoadingPage} />
        <Stack.Screen name="Home" component={TabNavigator} options={{ animation: 'fade' }} />
        <Stack.Screen name="Profile" component={ProfilePage} />
        <Stack.Screen name="Chat" component={ChatPage} />
        <Stack.Screen
          name="Onboarding"
          component={OnboardingPage}
          options={{ animation: 'fade' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
