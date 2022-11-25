/* eslint-disable react-hooks/exhaustive-deps */
import { Provider, useAtom, useSetAtom } from 'jotai';
import React, { useEffect, useState } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createListeners, startSDK } from './services/bridgefy-link';
import { TabNavigator, ProfilePage } from './pages';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

  const Stack = createNativeStackNavigator();

  const onConnect = (userID: string) => {
    if (!connections.includes(userID)) {
      console.log(connections);
      console.log(userID);
      setConnections([...connections, userID]);
      setMessagesRecieved(
        new Map(messagesRecieved.set(userID, getMessagesFromStorage(userID))),
      );
    }
  };

  const onDisconnect = (userID: string) => {
    setConnections(connections.filter(user => user !== userID));
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
    setMessagesRecieved(
      new Map(
        messagesRecieved.set(
          connections[0],
          getMessagesFromStorage(connections[0]),
        ),
      ),
    );
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
      setMessagesRecieved(
        new Map(
          messagesRecieved.set(
            connections[0],
            getMessagesFromStorage(connections[0]),
          ),
        ),
      );
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
    createListeners(onConnect, onDisconnect, onRecieve, onSent);
    setAllUsers(getArrayOfConvos());
  }, [setAllUsers]);

  return (
    <Provider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={TabNavigator} />
          <Stack.Screen name="Profile" component={ProfilePage} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
