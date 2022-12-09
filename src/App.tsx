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
import {
  createListeners,
  sendMessage,
  startSDK,
} from './services/bridgefy-link';
import {
  addMessageToStorage,
  ContactInfo,
  getArrayOfConvos,
  getContactInfo,
  getMessagesFromStorage,
  getOrCreateContactInfo,
  getOrCreateUserInfo,
  getPendingMessage,
  logDisconnect,
  Message,
  RawMessage,
  removePendingMessage,
  updateContactInfo,
} from './services/database';

export default function App() {
  const [userInfo, setUserInfo] = useAtom(userInfoAtom);
  const [connections, setConnections] = useAtom(connectionsAtom);
  const [messagesRecieved, setMessagesRecieved] = useAtom(messagesRecievedAtom);
  const [, setAllUsers] = useAtom(allUsersAtom);

  console.log('(App) Received: ', messagesRecieved);
  console.log('(App) Connections: ', connections);

  const Stack = createNativeStackNavigator();

  // remember that we connect with many people who are not in our contacts and we will not speak to
  // not all connections will be or should be in our contacts
  const onConnect = (contactID: string) => {
    if (!connections.includes(contactID)) {
      console.log('(onConnect) Connected:', contactID, connections);
      setConnections([...connections, contactID]);

      // check whether connected user has our updated name
      checkUpToDateName(contactID);
    }
  };

  // checks whether a contact has our updated name and sends it if not
  const checkUpToDateName = (contactID: string) => {
    // check if contact info exists
    const contactInfo = getContactInfo(contactID);
    if (contactInfo && userInfo) {
      // check if user's contact info is up to date
      if (contactInfo.lastSeen < userInfo.dateUpdated) {
        // send a username update message
        const messageObj: RawMessage = {
          text: userInfo.name,
          flags: 1,
        };
        const messageString = JSON.stringify(messageObj);
        sendMessage(messageString, contactID);
      }
    }
  };

  const onDisconnect = (userID: string) => {
    console.log('(onDisconnect) Disconnected:', userID, connections);
    setConnections(connections.filter(user => user !== userID));
    logDisconnect(userID);
  };

  const onMessageSent = (messageID: string) => {
    // should never happen, remove once confident
    if (messageID === null) {
      console.log('(onMessageSent) Fail, messageID is null.');
      throw new Error('(onMessageSent) messageID is null');
    }

    // this callback means the message is confirmed sent, get pending message
    const confirmedMessage = getPendingMessage(messageID);
    if (!confirmedMessage?.messageID) {
      console.log('(onMessageSent) Fail, pending message not found.');
      return;
    }

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
        contactInfo.lastMessageIndex,
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
