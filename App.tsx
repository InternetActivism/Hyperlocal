import { Provider } from 'jotai';
import React from 'react';

import { ConversationsPage, SamplePage } from './src/scenes';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

export default function App() {
  const Tab = createBottomTabNavigator();

  return (
    <Provider>
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="Sample"
          screenOptions={{ headerShown: false }}>
          <Tab.Screen name="Sample" component={SamplePage} />
          <Tab.Screen name="Conversations" component={ConversationsPage} />
        </Tab.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
