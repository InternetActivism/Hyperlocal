import React from 'react';

import { ConversationsNavigation, SamplePage, DiscoverPage } from '../../pages';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';

export default function TabNavigator() {
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      initialRouteName="ConversationsNavigation"
      screenOptions={{ headerShown: false }}
      sceneContainerStyle={styles.container}>
      <Tab.Screen name="Sample" component={SamplePage} />
      <Tab.Screen
        name="ConversationsNavigation"
        component={ConversationsNavigation}
      />
      <Tab.Screen name="Discover" component={DiscoverPage} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
});
