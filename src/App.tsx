import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import { useAtom, useAtomValue } from 'jotai';
import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';
import InAppNotification from './components/ui/InAppNotification';
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
export default function App(): JSX.Element {
  const Stack = createStackNavigator<RootStackParamList>();
  const navigationRef = createNavigationContainerRef<RootStackParamList>();
  const [currentView, setCurrentView] = useAtom(currentViewAtom);
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
      navigationRef.current.navigate('Loading');
      startSDK().catch((e) => console.error(e));
    }

    if (appStateVisible.match(/inactive|background/)) {
      stopSDK().catch((e) => console.error(e));
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

  const screenOptions = {
    gestureEnabled: true,
    headerShown: false,
    cardStyle: {
      backgroundColor: vars.backgroundColor,
    },
    cardStyleInterpolator: ({ current, layouts }: any) => {
      const backgroundColor =
        currentView !== null ? vars.backgroundColorSecondary : vars.backgroundColor;

      return {
        cardStyle: {
          backgroundColor,
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
              }),
            },
          ],
        },
        overlayStyle: {
          opacity: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.5],
          }),
        },
      };
    },
  };

  return (
    <SafeAreaProvider>
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
        onReady={() => SplashScreen.hide()}
      >
        <Stack.Navigator initialRouteName="Loading" screenOptions={screenOptions}>
          <Stack.Screen
            name="Loading"
            component={LoadingPage}
            options={{
              cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
              animationTypeForReplace: 'pop',
            }}
          />
          <Stack.Screen
            name="Home"
            component={TabNavigator}
            options={{ cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid }}
          />
          <Stack.Screen name="Profile" component={ProfilePage} />
          <Stack.Screen name="Chat" component={ChatPage} />
          <Stack.Screen name="PublicChat" component={PublicChatPage} />
          <Stack.Screen
            name="Onboarding"
            component={OnboardingNavigator}
            options={{ cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid }}
          />
        </Stack.Navigator>
        <InAppNotification />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
