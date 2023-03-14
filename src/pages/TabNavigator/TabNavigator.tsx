import React from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import ChevronRightIcon from '../../components/ui/Icons/ChevronRightIcon';
import MessageIcon from '../../components/ui/Icons/MessageIcon/MessageIcon';
import MessageIconSelected from '../../components/ui/Icons/MessageIcon/MessageIconSelected';
import PeopleIcon from '../../components/ui/Icons/PeopleIcon/PeopleIcon';
import PeopleIconSelected from '../../components/ui/Icons/PeopleIcon/PeopleIconSelected';
import { ConversationsPage, DebugPage, DiscoverPage } from '../../pages';
import { vars } from '../../utils/theme';

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
        tabBarStyle: styles.navigator,
      })}
      sceneContainerStyle={styles.container}
    >
      {__DEV__ ? <Tab.Screen name="Debug" component={DebugPage} /> : null}
      <Tab.Screen name="Discover" component={DiscoverPage} />
      <Tab.Screen name="ConversationsNavigation" component={ConversationsPage} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  navigator: {
    backgroundColor: vars.backgroundColor,
    height: 100,
    borderTopColor: '#424242',
  },
  container: {
    backgroundColor: vars.backgroundColor,
  },
});
