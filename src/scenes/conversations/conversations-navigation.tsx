import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ConversationsPage from './conversations-page';
import { ChatPage } from '../chat';

const ConversationsStack = createNativeStackNavigator();

const ConversationsNavigation = () => {
  return (
    <ConversationsStack.Navigator
      initialRouteName="Conversations"
      screenOptions={{ headerShown: false }}>
      <ConversationsStack.Screen
        name="Conversations"
        component={ConversationsPage}
      />
      <ConversationsStack.Screen name="Chat" component={ChatPage} />
    </ConversationsStack.Navigator>
  );
};

export default ConversationsNavigation;
