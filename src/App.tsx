import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAtomValue, useSetAtom } from 'jotai';
import React, { useEffect } from 'react';
import { Text } from 'react-native';
import useInitializeApp from './hooks/useInitializeApp';
import ChatPage from './pages/ChatPage';
import LoadingPage from './pages/LoadingPage';
import OnboardingNavigator, { isOnboardingRoute } from './pages/Onboarding/OnboardingNavigator';
import ProfilePage from './pages/ProfilePage';
import { PublicChatPage } from './pages/PublicChatPage';
import TabNavigator from './pages/TabNavigator';
import {
  appVisibleAtom,
  bridgefyStatusAtom,
  currentUserInfoAtom,
  currentViewAtom,
} from './services/atoms';
import { startSDK, stopSDK } from './services/bridgefy-link';
import { BridgefyErrorStates } from './utils/globals';
import { vars } from './utils/theme';

export type RootStackParamList = {
  Loading: undefined; // Add this line
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
export default function App(): JSX.Element {
  const Stack = createNativeStackNavigator<RootStackParamList>();
  const navigationRef = createNavigationContainerRef<RootStackParamList>();
  const setCurrentView = useSetAtom(currentViewAtom);
  const bridgefyStatus = useAtomValue(bridgefyStatusAtom);
  const appStateVisible = useAtomValue(appVisibleAtom);
  const currentUserInfo = useAtomValue(currentUserInfoAtom);

  //@ts-ignore
  Text.defaultProps = Text.defaultProps || {};
  // @ts-ignore
  Text.defaultProps.allowFontScaling = false;
  // @ts-ignore
  Text.defaultProps.maxFontSizeMultiplier = 1;

  useInitializeApp();

  // We need this useEffect here to call navigation events on state change.
  useEffect(() => {
    if (
      !currentUserInfo.isInitialized ||
      navigationRef.current === null ||
      !navigationRef.isReady() ||
      appStateVisible === null
    ) {
      return;
    }

    if (appStateVisible === 'active') {
      console.log('Starting the SDK as return to app.');
      navigationRef.current.navigate('Loading');

      startSDK();
    }

    if (appStateVisible.match(/inactive|background/)) {
      console.log('Stopping the SDK as leaving app.');
      stopSDK().catch((e) => {
        console.log(e);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appStateVisible]);

  useEffect(() => {
    if (
      navigationRef.current === null ||
      !navigationRef.isReady() ||
      navigationRef.getCurrentRoute()?.name === 'Onboarding' ||
      navigationRef.getCurrentRoute()?.name === 'Loading' ||
      isOnboardingRoute(navigationRef.getCurrentRoute()?.name ?? '')
    ) {
      return;
    }

    // navigate to the loading page if the bridgefy SDK is not ready
    // || bridgefyStatus === BridgefyStates.OFFLINE this breaks the app since Bridgefy is stopping and starting for unknown reasons
    if (BridgefyErrorStates.includes(bridgefyStatus)) {
      console.error('Error state! Navigating to loading page. Bridgefy status: ', bridgefyStatus);
      navigationRef.current.navigate('Loading');
    }
  }, [bridgefyStatus, navigationRef]);

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
