import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ConversationsPage from './ConversationsPage';
import { ChatPage } from '../Chat';
import { StyleSheet } from 'react-native';

const ConversationsStack = createNativeStackNavigator();

const ConversationsNavigation = () => {
  return (
    <ConversationsStack.Navigator
      initialRouteName="Conversations"
      screenOptions={{
        headerShown: false,
        contentStyle: styles.container,
      }}>
      <ConversationsStack.Screen
        name="Conversations"
        component={ConversationsPage}
      />
      <ConversationsStack.Screen name="Chat" component={ChatPage} />
    </ConversationsStack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
});

export default ConversationsNavigation;
