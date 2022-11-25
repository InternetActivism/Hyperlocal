import { Provider, useAtom, useAtomValue, useSetAtom } from 'jotai';
import React, { useEffect, useState } from 'react';

import { ConversationsNavigation, SamplePage, DiscoverPage } from './pages';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createListeners, startSDK } from './services/bridgefy-link';
import {
  allUsersAtom,
  connectionsAtom,
  messagesRecievedAtom,
  pendingMessageAtom,
} from './services/atoms';
import {
  addMessageToStorage,
  getArrayOfConvos,
  getMessagesFromStorage,
  Message,
} from './services/database';

export default function App() {
  const [connections, setConnections] = useAtom(connectionsAtom);
  const [messagesRecieved, setMessagesRecieved] = useAtom(messagesRecievedAtom);
  const [pendingMessage, setPendingMessage] = useAtom(pendingMessageAtom);
  const [sendMessageToID, setSendMessageToID] = useState<string>('');
  const [recieveMessageFromID, setRecieveMessageFromID] = useState<string[]>(
    [],
  );
  const setAllUsers = useSetAtom(allUsersAtom);

  console.log('app: ', messagesRecieved, ' connections: ', connections);

  const Tab = createBottomTabNavigator();

  const onConnect = (userID: string) => {
    if (!connections.includes(userID)) {
      console.log(connections);
      console.log(userID);
      setConnections([...connections, userID]);
      setMessagesRecieved(getMessagesFromStorage(userID));
    }
  };

  const addRecievedMessageToStorage = () => {
    if (connections.length === 0) {
      console.log('no connections');
      return;
    }
    if (recieveMessageFromID.length !== 2) {
      console.log('not adding recieved message to storage');
      return;
    }
    addMessageToStorage(
      connections[0],
      recieveMessageFromID[0],
      recieveMessageFromID[1],
      true,
    );
    setMessagesRecieved(getMessagesFromStorage(connections[0]));
    // setMessagesRecieved([...messagesRecieved, text]);
  };

  const saveMessageToStorage = () => {
    console.log('sent with message: "' + pendingMessage + '"');
    if (pendingMessage !== '') {
      console.log('pending message: ', pendingMessage);
      addMessageToStorage(
        connections[0],
        pendingMessage,
        sendMessageToID,
        false,
      );
      setMessagesRecieved(getMessagesFromStorage(connections[0]));
      console.log('resetting pending');
      setPendingMessage('');
    }
  };

  const onSent = (message: string) => {
    setSendMessageToID(message);
  };

  const onRecieve = (message: string[]) => {
    setRecieveMessageFromID(message);
  };

  useEffect(() => {
    addRecievedMessageToStorage();
  }, [recieveMessageFromID]);

  useEffect(() => {
    saveMessageToStorage();
  }, [sendMessageToID]);

  useEffect(() => {
    startSDK();
    createListeners(onConnect, onRecieve, onSent);
    setAllUsers(getArrayOfConvos());
  }, [setAllUsers]);

  return (
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
  );
}
