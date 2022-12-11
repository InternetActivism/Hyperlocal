import React from 'react';

import { ConversationsPage, DiscoverPage, SamplePage } from '../../pages';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import PeopleIcon from '../../components/ui/Icons/PeopleIcon/PeopleIcon';
import PeopleIconSelected from '../../components/ui/Icons/PeopleIcon/PeopleIconSelected';
import MessageIconSelected from '../../components/ui/Icons/MessageIcon/MessageIconSelected';
import MessageIcon from '../../components/ui/Icons/MessageIcon/MessageIcon';
import ChevronRightIcon from '../../components/ui/Icons/ChevronRightIcon';

export default function TabNavigator() {
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      initialRouteName="Discover"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarLabel: () => {
          return null;
        },
        tabBarIcon: ({ focused }) => {
          let iconComponent = <ChevronRightIcon />;

          if (route.name === 'Discover') {
            iconComponent = focused ? <PeopleIconSelected /> : <PeopleIcon />;
          } else if (route.name === 'ConversationsNavigation') {
            iconComponent = focused ? <MessageIconSelected /> : <MessageIcon />;
          }

          return iconComponent;
        },
      })}
      sceneContainerStyle={styles.container}>
      <Tab.Screen name="Sample" component={SamplePage} />
      <Tab.Screen name="Discover" component={DiscoverPage} />
      <Tab.Screen
        name="ConversationsNavigation"
        component={ConversationsPage}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
});
