import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSetAtom } from 'jotai';
import * as React from 'react';
import useInitializeApp from './hooks/useInitializeApp';
import { LoadingPage, OnboardingPage, ProfilePage, TabNavigator } from './pages';
import { ChatPage } from './pages/Chat';
import { chatContactAtom } from './services/atoms';
import { vars } from './utils/theme';

export type RootStackParamList = {
  Loading: undefined;
  Home: undefined;
  Profile: undefined;
  Chat: { user: string };
  Onboarding: undefined;
};

function isChatProps(props: any): props is RootStackParamList['Chat'] {
  return props.user !== undefined;
}

/* App handles all functionality before starting the bridgefy SDK */
export default function App() {
  const Stack = createNativeStackNavigator<RootStackParamList>();
  const navigationRef = createNavigationContainerRef();

  const setChatContact = useSetAtom(chatContactAtom);

  useInitializeApp();

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={() => {
        const currentRouteName = navigationRef.getCurrentRoute()?.name ?? '';
        const currentProps = navigationRef.getCurrentRoute()?.params;
        if (currentRouteName === 'Chat' && isChatProps(currentProps)) {
          setChatContact(currentProps.user);
        } else {
          setChatContact(null);
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
        <Stack.Screen
          name="Onboarding"
          component={OnboardingPage}
          options={{ animation: 'fade' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
