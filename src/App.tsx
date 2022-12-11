/* eslint-disable react-hooks/exhaustive-deps */
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAtom } from 'jotai';
import React, { useEffect } from 'react';
import { LoadingPage, ProfilePage, TabNavigator } from './pages';
import { ChatPage } from './pages/Chat';
import {
  allUsersAtom,
  userInfoAtom,
  messagesRecievedAtom,
  connectionsAtomWithListener,
  addConnectionAtom,
  removeConnectionAtom,
} from './services/atoms';
import {
  createListeners,
  sendMessage,
  startSDK,
} from './services/bridgefy-link';
import {
  getContactInfo,
  getOrCreateContactInfo,
  logDisconnect,
  updateContactInfo,
} from './services/contacts';
import {
  ContactInfo,
  getArrayOfConvos,
  Message,
  PendingMessage,
  RawMessage,
  sendMessageWrapper,
} from './services/database';
import {
  addMessageToStorage,
  getMessagesFromStorage,
  getPendingMessage,
  removePendingMessage,
} from './services/messages';
import { getOrCreateUserInfo } from './services/user';

export default function App() {
  const [userInfo, setUserInfo] = useAtom(userInfoAtom);
  const [connections] = useAtom(connectionsAtomWithListener);
  const [, addConnection] = useAtom(addConnectionAtom);
  const [, removeConnection] = useAtom(removeConnectionAtom);
  const [messagesRecieved, setMessagesRecieved] = useAtom(messagesRecievedAtom);
  const [, setAllUsers] = useAtom(allUsersAtom);

  // console.log('(App) Received: ', messagesRecieved);
  console.log('(App) Connections: ', connections);

  const Stack = createNativeStackNavigator();

  // remember that we connect with many people who are not in our contacts and we will not speak to
  // not all connections will be or should be in our contacts
  const onConnect = (contactID: string) => {
    console.log('(onConnect) Connected:', contactID, connections);
    if (!connections.includes(contactID)) {
      addConnection(contactID);
      // check whether connected user has our updated name
      checkUpToDateName(contactID);
    }
  };

  // checks whether a contact has our updated name and sends it if not
  const checkUpToDateName = (contactID: string) => {
    if (!userInfo) return;

    console.log('(checkUpToDateName) Checking:', contactID);
    // check if contact info exists
    const contactInfo = getContactInfo(contactID);
    console.log(
      '(checkUpToDateName) Bool checks:',
      contactInfo,
      userInfo,
      contactInfo && userInfo && contactInfo.lastSeen < userInfo.dateUpdated,
    );

    // send username update to non contacts! don't keep this? privacy?
    if (!contactInfo) {
      console.log('(checkUpToDateName) Sending username update:', contactID);
      // send a username update message
      sendMessageWrapper(userInfo.name, 1, contactID);
      return;
    }

    // check if user's contact info is up to date, send update if not
    if (contactInfo.lastSeen < userInfo.dateUpdated) {
      console.log('(checkUpToDateName) Sending username update:', contactID);
      // send a username update message
      sendMessageWrapper(userInfo.name, 1, contactID);
    }
  };

  const onDisconnect = (userID: string) => {
    console.log('(onDisconnect) Disconnected:', userID, connections);
    removeConnection(userID);
    logDisconnect(userID);
  };

  const onMessageSent = (messageID: string) => {
    console.log('(onMessageSent) Sent:', messageID);
    // should never happen, remove once confident
    if (messageID === null) {
      console.log('(onMessageSent) Fail, messageID is null.');
      throw new Error('(onMessageSent) messageID is null');
    }

    // check whether sent message was pending and if so, save it
    const confirmedMessage = getPendingMessage(messageID);
    if (confirmedMessage?.messageID) {
      savePendingMessage(messageID, confirmedMessage);
    } else {
      console.log('(onMessageSent) Not a pending message.');
    }
  };

  const savePendingMessage = (
    messageID: string,
    confirmedMessage: PendingMessage,
  ) => {
    console.log(
      '(savePendingMessage) Message confirmed sent, saving to database: ',
      messageID,
      confirmedMessage,
    );
    // get/create contact info
    const contactInfo = getOrCreateContactInfo(confirmedMessage.recipient);

    // save message to storage
    saveMessage(
      contactInfo,
      messageID,
      confirmedMessage.text,
      confirmedMessage.flags,
      false,
    );

    // remove pending message
    removePendingMessage(messageID);
  };

  const onMessageReceived = (message: string[]) => {
    // should never happen, remove once confident
    if (message.length !== 3 || message[2] === null) {
      console.log('(addRecievedMessageToStorage) Fail, misformed.', message);
      throw new Error('(addRecievedMessageToStorage) Message misformed');
    }

    // get/create contact info
    const contactInfo = getOrCreateContactInfo(message[2]);

    // check message flags
    const messageContent = message[0];
    let parsedMessage: RawMessage;

    try {
      parsedMessage = JSON.parse(messageContent);
    } catch (e) {
      console.log('(onMessageReceived) Fail, not JSON.', messageContent);
      throw new Error('(onMessageReceived) Not JSON.');
    }

    // should never happen, remove once confident
    if (parsedMessage.text === null) {
      console.log('(onMessageReceived) Fail, no text.');
      throw new Error('(onMessageReceived) No text.');
    }

    // save message to storage
    saveMessage(
      contactInfo,
      message[1],
      parsedMessage.text,
      parsedMessage.flags,
      true,
    );
  };

  const saveMessage = (
    contactInfo: ContactInfo,
    messageID: string,
    text: string,
    flags: number,
    isReciever: boolean,
  ) => {
    // save message to storage
    addMessageToStorage(
      contactInfo.contactID,
      text,
      flags,
      messageID,
      isReciever,
      Date.now(),
      contactInfo.lastMessageIndex + 1,
    );

    // check for username change
    if (flags === 1) {
      console.log(
        '(onMessageReceived) Username change for',
        contactInfo.contactID,
      );
      updateContactInfo({
        ...contactInfo,
        name: text,
        lastMessageIndex: contactInfo.lastMessageIndex + 1,
      });
      // cause the conversations page to rerender
      setAllUsers(getArrayOfConvos());
      // cause the contact page to rerender
      removeConnection('');
      console.log(
        '(onMessageReceived) Updated contact info:',
        getContactInfo(contactInfo.contactID),
      );
    } else {
      // update message index
      updateContactInfo({
        ...contactInfo,
        lastMessageIndex: contactInfo.lastMessageIndex + 1,
      });
    }

    // update messagesRecieved
    const updatedMessagesRecieved = new Map(messagesRecieved);
    updatedMessagesRecieved.set(
      contactInfo.contactID,
      getMessagesFromStorage(
        contactInfo.contactID,
        contactInfo.lastMessageIndex + 1,
      ), // inefficient
    );
    setMessagesRecieved(updatedMessagesRecieved);

    // update local state of all users
    setAllUsers(getArrayOfConvos());
  };

  const onStart = (userID: string) => {
    console.log('(onStart) Starting with ID:', userID);
    const user = getOrCreateUserInfo(userID);
    setUserInfo(user);
  };

  const initializeAllConvos = () => {
    const allConvos = getArrayOfConvos();

    let allMessagesMap: Map<string, Message[]> = new Map();
    for (let i = 0; i < allConvos.length; i++) {
      const contactInfo = getOrCreateContactInfo(allConvos[i]);
      allMessagesMap.set(
        allConvos[i],
        getMessagesFromStorage(allConvos[i], contactInfo.lastMessageIndex),
      );
    }

    setMessagesRecieved(allMessagesMap);
  };

  // check if user's name is up to date with all connections when user info is changed/loaded
  useEffect(() => {
    if (userInfo !== null) {
      // iterate through all connections
      for (let i = 0; i < connections.length; i++) {
        checkUpToDateName(connections[i]);
      }
    }
  }, [userInfo]);

  useEffect(() => {
    // console log connections
    console.log('(App) Connections update:', connections);
  }, [connections]);

  // only run once
  useEffect(() => {
    console.log('(initialization) WARNING: Starting app...');
    // remove all connections
    for (let i = 0; i < connections.length; i++) {
      removeConnection(connections[i]);
    }
    // reset messages recieved
    // setMessagesRecieved(new Map());
    // reset all users
    // setAllUsers([]);
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
