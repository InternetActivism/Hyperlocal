import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAtom } from 'jotai';
import React, { useEffect } from 'react';
import { LoadingPage, ProfilePage, TabNavigator } from './pages';
import { ChatPage } from './pages/Chat';
import {
  allUsersAtom,
  connectionsAtom,
  userInfoAtom,
  messagesRecievedAtom,
} from './services/atoms';
import { createListeners, startSDK } from './services/bridgefy-link';
import {
  addMessageToStorage,
  getArrayOfConvos,
  getMessagesFromStorage,
  getOrCreateUserInfo,
  getPendingMessage,
  logDisconnect,
  Message,
  removePendingMessage,
} from './services/database';

export default function App() {
  const [userInfo, setUserInfo] = useAtom(userInfoAtom);
  const [connections, setConnections] = useAtom(connectionsAtom);
  const [messagesRecieved, setMessagesRecieved] = useAtom(messagesRecievedAtom);
  const [, setAllUsers] = useAtom(allUsersAtom);

  console.log('app: ', messagesRecieved, ' connections: ', connections);

  const Stack = createNativeStackNavigator();

  const onConnect = (userID: string) => {
    if (!connections.includes(userID)) {
      console.log('(onConnect) Connected:', userID, connections);
      setConnections([...connections, userID]);
      // setMessagesRecieved(
      //   new Map(messagesRecieved.set(userID, getMessagesFromStorage(userID))),
      // );
    }
  };

  const onDisconnect = (userID: string) => {
    console.log('(onDisconnect) Disconnected:', userID, connections);
    setConnections(connections.filter(user => user !== userID));
    logDisconnect(userID);
  };

  const onMessageSent = (messageID: string) => {
    if (messageID === null) {
      console.log('(onMessageSent) Fail, messageID is null.');
      return;
    }
    const confirmedMessage = getPendingMessage(messageID);
    if (!confirmedMessage?.messageID) {
      console.log('(onMessageSent) Fail, message not found.');
      return;
    }
    addMessageToStorage(
      confirmedMessage.recipient,
      confirmedMessage.text,
      messageID,
      false,
      Date.now(),
    );
    setMessagesRecieved(
      new Map(
        messagesRecieved.set(
          confirmedMessage.recipient,
          getMessagesFromStorage(confirmedMessage.recipient),
        ),
      ),
    );
    setAllUsers(getArrayOfConvos());
    removePendingMessage(messageID);
  };

  const onMessageReceived = (message: string[]) => {
    if (message.length !== 3 || message[2] === null) {
      console.log('(addRecievedMessageToStorage) Fail, misformed.', message);
      return;
    }

    addMessageToStorage(message[2], message[0], message[1], true, Date.now());
    setMessagesRecieved(
      new Map(
        messagesRecieved.set(message[2], getMessagesFromStorage(message[2])),
      ),
    );
    setAllUsers(getArrayOfConvos());
  };

  const onStart = (bridgefyID: string) => {
    console.log('onStart called');
    const user = getOrCreateUserInfo(bridgefyID);
    setUserInfo(user);
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
    createListeners(
      onStart,
      onConnect,
      onDisconnect,
      onMessageReceived,
      onMessageSent,
    );
    startSDK();
    setAllUsers(getArrayOfConvos());
    initializeAllConvos();
  }, []);

  return (
    <>
      {userInfo !== null ? (
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
