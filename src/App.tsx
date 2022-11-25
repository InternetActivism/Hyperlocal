/* eslint-disable react-hooks/exhaustive-deps */
import { useAtom, useSetAtom } from 'jotai';
import React, { useEffect, useState } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createListeners, startSDK } from './services/bridgefy-link';
import { TabNavigator, ProfilePage, LoadingPage } from './pages';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  allUsersAtom,
  connectionsAtom,
  currentUserInfoAtom,
  messagesRecievedAtom,
  pendingMessageAtom,
  pendingRecipientAtom,
} from './services/atoms';
import {
  addMessageToStorage,
  getArrayOfConvos,
  getMessagesFromStorage,
  getOrCreateCurrentUser,
  logDisconnect,
  Message,
} from './services/database';
import { ChatPage } from './pages/Chat';

export default function App() {
  const [currentUserInfo, setCurrentUserInfo] = useAtom(currentUserInfoAtom);
  const [connections, setConnections] = useAtom(connectionsAtom);
  const [messagesRecieved, setMessagesRecieved] = useAtom(messagesRecievedAtom);
  const [pendingMessage, setPendingMessage] = useAtom(pendingMessageAtom);
  const [pendingRecipient, setPendingRecipient] = useAtom(pendingRecipientAtom);
  const [sendMessageToID, setSendMessageToID] = useState<string>('');
  const [recieveMessageFromID, setRecieveMessageFromID] = useState<string[]>(
    [],
  );
  const [allUsers, setAllUsers] = useAtom(allUsersAtom);

  console.log('app: ', messagesRecieved, ' connections: ', connections);

  const Stack = createNativeStackNavigator();

  const onConnect = (userID: string) => {
    if (!connections.includes(userID)) {
      console.log(connections);
      console.log(userID);
      setConnections([...connections, userID]);
      // setMessagesRecieved(
      //   new Map(messagesRecieved.set(userID, getMessagesFromStorage(userID))),
      // );
    }
  };

  const onDisconnect = (userID: string) => {
    setConnections(connections.filter(user => user !== userID));
    logDisconnect(userID);
  };

  const addRecievedMessageToStorage = () => {
    if (connections.length === 0) {
      console.log('no connections');
      return;
    }
    if (recieveMessageFromID.length !== 3) {
      console.log('not adding recieved message to storage');
      return;
    }
    if (recieveMessageFromID[2] === null) {
      console.log('no sender in recieved message');
      return;
    }

    addMessageToStorage(
      recieveMessageFromID[2],
      recieveMessageFromID[0],
      recieveMessageFromID[1],
      true,
    );
    setMessagesRecieved(
      new Map(
        messagesRecieved.set(
          recieveMessageFromID[2],
          getMessagesFromStorage(recieveMessageFromID[2]),
        ),
      ),
    );
    setAllUsers(getArrayOfConvos());
    // setMessagesRecieved([...messagesRecieved, text]);
  };

  const saveMessageToStorage = () => {
    console.log('sent with message: "' + pendingMessage + '"');
    if (pendingMessage !== '') {
      console.log('pending message: ', pendingMessage);
      addMessageToStorage(
        pendingRecipient,
        pendingMessage,
        sendMessageToID,
        false,
      );
      setMessagesRecieved(
        new Map(
          messagesRecieved.set(
            pendingRecipient,
            getMessagesFromStorage(pendingRecipient),
          ),
        ),
      );
      setAllUsers(getArrayOfConvos());
      console.log('resetting pending');
      setPendingMessage('');
      setPendingRecipient('');
    }
  };

  const onSent = (message: string) => {
    setSendMessageToID(message);
  };

  const onRecieve = (message: string[]) => {
    setRecieveMessageFromID(message);
  };

  const onStart = (bridgefyID: string) => {
    console.log('onStart called');
    const user = getOrCreateCurrentUser(bridgefyID);
    setCurrentUserInfo(user);
  };

  const initializeAllConvos = () => {
    const allConvos = getArrayOfConvos();

    let allMessagesMap: Map<string, Message[]> = new Map();
    for (let i = 0; i < allConvos.length; i++) {
      allMessagesMap.set(allConvos[i], getMessagesFromStorage(allConvos[i]));
    }

    setMessagesRecieved(allMessagesMap);
  };

  useEffect(() => {
    addRecievedMessageToStorage();
  }, [recieveMessageFromID]);

  useEffect(() => {
    saveMessageToStorage();
  }, [sendMessageToID]);

  useEffect(() => {
    createListeners(onStart, onConnect, onDisconnect, onRecieve, onSent);
    startSDK();
    setAllUsers(getArrayOfConvos());
    initializeAllConvos();
  }, []);

  return (
    <>
      {currentUserInfo !== null ? (
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={TabNavigator} />
            <Stack.Screen name="Profile" component={ProfilePage} />
            <Stack.Screen name="Chat" component={ChatPage} />
          </Stack.Navigator>
        </NavigationContainer>
      ) : (
        <LoadingPage />
      )}
    </>
  );
}
