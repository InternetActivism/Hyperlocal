import { Provider } from 'jotai';
import React from 'react';

import { ConversationsNavigation, SamplePage, DiscoverPage } from './src/scenes';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChatPage } from './src/scenes/chat';

export default function App() {
  const Tab = createBottomTabNavigator();

  return (
    <Provider>
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="ConversationsNavigation"
          screenOptions={{ headerShown: false }}>
          <Tab.Screen name="Sample" component={SamplePage} />
          <Tab.Screen
            name="ConversationsNavigation"
            component={ConversationsNavigation}
          />
          <Tab.Screen name="Discover" component={DiscoverPage} />
        </Tab.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
