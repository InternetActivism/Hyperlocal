import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSetAtom } from 'jotai';
import React from 'react';
import { Text } from 'react-native';
import useInitializeApp from './hooks/useInitializeApp';
import ChatPage from './pages/ChatPage';
import LoadingPage from './pages/LoadingPage';
import OnboardingNavigator from './pages/Onboarding/OnboardingNavigator';
import ProfilePage from './pages/ProfilePage';
import { PublicChatPage } from './pages/PublicChatPage';
import TabNavigator from './pages/TabNavigator';
import { currentViewAtom } from './services/atoms';
import { vars } from './utils/theme';

export type RootStackParamList = {
  Loading: undefined;
  Home: undefined;
  Profile: undefined;
  Chat: { user: string };
  Onboarding: undefined;
  PublicChat: undefined;
};

function isChatProps(props: any): props is RootStackParamList['Chat'] {
  return props.user !== undefined;
}

/* App handles all functionality before starting the bridgefy SDK */
export default function App() {
  const Stack = createNativeStackNavigator<RootStackParamList>();
  const navigationRef = createNavigationContainerRef();
  const setCurrentView = useSetAtom(currentViewAtom);

  Text.defaultProps = Text.defaultProps || {};
  Text.defaultProps.allowFontScaling = false;
  Text.defaultProps.maxFontSizeMultiplier = 1;

  useInitializeApp();

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={() => {
        const currentRouteName = navigationRef.getCurrentRoute()?.name ?? '';
        const currentProps = navigationRef.getCurrentRoute()?.params;
        if (currentRouteName === 'Chat' && isChatProps(currentProps)) {
          setCurrentView(currentProps.user);
        } else if (currentRouteName === 'PublicChat') {
          setCurrentView('PUBLIC_CHAT');
        } else {
          setCurrentView(null);
        }
      }}
    >
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
        <Stack.Screen name="PublicChat" component={PublicChatPage} />
        <Stack.Screen
          name="Onboarding"
          component={OnboardingNavigator}
          options={{ animation: 'fade' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
