import React from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAtom } from 'jotai';
import { StyleSheet } from 'react-native';
import ChevronRightIcon from '../components/ui/Icons/ChevronRightIcon';
import DiscoverIcon from '../components/ui/Icons/DiscoverIcon/DiscoverIcon';
import MessageIcon from '../components/ui/Icons/MessageIcon/MessageIcon';
import { getUnreadCountAtom } from '../services/atoms';
import { vars } from '../utils/theme';
import ConversationsPage from './ConversationsPage';
import DebugPage from './DebugPage';
import DiscoverPage from './DiscoverPage';

function TabNavigatorWrapper() {
  const [unreadCountState] = useAtom(getUnreadCountAtom);
  return (
    <TabNavigator
      publicChatUnreadCount={unreadCountState.publicChatUnreadCount}
      unreadCount={unreadCountState.unreadCount}
    />
  );
}

interface Props {
  publicChatUnreadCount: number;
  unreadCount: number;
}

function TabNavigator({ publicChatUnreadCount, unreadCount }: Props) {
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
          if (route.name === 'Discover') {
            return <DiscoverIcon notification={publicChatUnreadCount > 0} selected={focused} />;
          } else if (route.name === 'ConversationsNavigation') {
            return <MessageIcon notification={unreadCount > 0} selected={focused} />;
          } else if (route.name === 'Debug') {
            return <ChevronRightIcon />;
          }
          return null;
        },
        tabBarStyle: styles.navigator,
      })}
      sceneContainerStyle={styles.container}
    >
      {__DEV__ ? <Tab.Screen name="Debug" component={DebugPage} /> : null}
      <Tab.Screen name="ConversationsNavigation" component={ConversationsPage} />
      <Tab.Screen name="Discover" component={DiscoverPage} />
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

export default TabNavigatorWrapper;
