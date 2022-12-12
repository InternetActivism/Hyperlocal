/* eslint-disable react-hooks/exhaustive-deps */
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAtom } from 'jotai';
import React, { useEffect } from 'react';
import { LoadingPage, ProfilePage, TabNavigator } from './pages';
import { ChatPage } from './pages/Chat';
import {
  getActiveConnectionsAtom,
  addConnectionAtom,
  removeConnectionAtom,
  currentUserInfoAtom,
  conversationsCacheAtom,
  allContactsAtom,
} from './services/atoms';
import { createListeners, startSDK } from './services/bridgefy-link';
import {
  getContactInfo,
  isContact,
  logDisconnect,
  setContactInfo,
  updateContactInfo,
} from './services/database/contacts';
import { ContactInfo, getContactsArray, RawMessage } from './services/database/database';
import {
  checkUpToDateName,
  checkUpToDateNameAll,
  getOrCreateUserInfo,
} from './services/database/user';

export default function App() {
  const [userInfo, setUserInfo] = useAtom(currentUserInfoAtom);
  const [connections] = useAtom(getActiveConnectionsAtom);
  const [, addConnection] = useAtom(addConnectionAtom);
  const [, removeConnection] = useAtom(removeConnectionAtom);
  const [messagesRecieved, setMessagesRecieved] = useAtom(conversationsCacheAtom);
  const [, setAllUsers] = useAtom(allContactsAtom);

  const Stack = createNativeStackNavigator();

  /*

    HOOKS

  */

  useEffect(() => {
    console.log('(initialization) WARNING: Starting app...');
    createListeners(
      onStart,
      onConnect,
      onDisconnect,
      onMessageReceived,
      onMessageSent,
      onMessageSentFailed
    );
    startSDK();
    setAllUsers(getContactsArray());
    initializeAllConvos();
  }, []);

  // check if user's name is up to date with all connections when user info is changed/loaded
  useEffect(() => {
    if (userInfo) {
      checkUpToDateNameAll(userInfo, connections);
    }
  }, [userInfo]);

  useEffect(() => {
    console.log('(App) Connections update:', connections);
  }, [connections]);

  /*

    EVENT LISTENERS

  */

  const onStart = (userID: string) => {
    console.log('(onStart) Starting with user ID:', userID);
    setUserInfo(getOrCreateUserInfo(userID));
  };

  // remember that we connect with many people who are not in our contacts and we will not speak to
  // not all connections will be or should be in our contacts
  const onConnect = (contactID: string) => {
    console.log('(onConnect) Connected:', contactID, connections);
    if (!connections.includes(contactID)) {
      addConnection(contactID);
      // check whether connected user has our updated name
      if (userInfo) {
        checkUpToDateName(contactID, userInfo);
      }
    }
  };

  const onDisconnect = (userID: string) => {
    console.log('(onDisconnect) Disconnected:', userID, connections);
    removeConnection(userID);
    logDisconnect(userID);
  };

  // called when a message is successfully sent out
  const onMessageSent = (messageID: string) => {
    console.log('(onMessageSent) Sent:', messageID);

    // check whether sent message was pending and if so, save it
    const confirmedMessage = getPendingMessage(messageID);
    if (!confirmedMessage || !confirmedMessage.messageID) {
      console.log('(onMessageSent) Not a pending message.');
      return;
    }

    // save message to storage
    // resolvePendingMesage(messageID, confirmedMessage);
  };

  // called when a message fails to send
  const onMessageSentFailed = (messageID: string, error: string) => {
    console.log('(onMessageSentFailed) Message was pending, saving as failed.', messageID);
    console.log('(onMessageSentFailed) Error:', error);

    // check whether sent message was pending and if so, save it
    const failedMessage = getPendingMessage(messageID);
    if (!failedMessage || !failedMessage.messageID) {
      console.log('(onMessageSentFailed) Not a pending message.');
      return;
    }

    failedMessage.flags = 2; // set confirmed message to failed
    // resolvePendingMesage(messageID, failedMessage); // save message to storage to display in chat as failed
  };

  // called when a message is received
  const onMessageReceived = (contactID: string, messageID: string, raw: string) => {
    if (!contactID || !messageID || !raw) {
      console.log(contactID, messageID, raw);
      throw new Error('(addRecievedMessageToStorage) Message misformed'); // remove this once in production, security risk
    }

    let contactInfo: ContactInfo;
    if (isContact(contactID)) {
      contactInfo = setContactInfo(contactID, {
        contactID: contactID,
        username: '',
        nickname: contactID,
        contactFlags: 0,
        verified: false, // used in future versions
        lastSeen: -1,
      });

      // TODO: update all users
    } else {
      contactInfo = getContactInfo(contactID);
    }

    let parsedMessage: RawMessage;
    try {
      parsedMessage = JSON.parse(raw);
    } catch (e) {
      console.log(raw);
      throw new Error('(onMessageReceived) Not JSON.');
    }

    // check for nickname change
    if (parsedMessage.flags === 1) {
      console.log('(onMessageReceived) Nickname change for', contactInfo.contactID);
      updateContactInfo(contactID, {
        ...contactInfo,
        nickname: parsedMessage.text,
      });
      setAllUsers(getArrayOfConvos()); // cause the conversations page to rerender
      removeConnection(''); // cause the contact page to rerender
    }

    processNewMessage(contactInfo, messageID, parsedMessage.text, parsedMessage.flags, true);

    setAllUsers(getContactsArray());
  };

  /*

    HELPER FUNCTIONS

  */

  // const resolvePendingMesage = (messageID: string, confirmedMessage: PendingMessage) => {
  //   console.log('(resolvePendingMesage) Pending msg status confirmed, saving: ', confirmedMessage);
  //   const contactInfo = getOrCreateContactInfo(confirmedMessage.recipient);
  //   processNewMessage(contactInfo, messageID, confirmedMessage.text, confirmedMessage.flags, false);
  //   removePendingMessage(messageID);
  // };

  // const processNewMessage = (
  //   contactInfo: ContactInfo,
  //   messageID: string,
  //   text: string,
  //   flags: number,
  //   isReciever: boolean
  // ) => {
  //   saveMessageToDB(
  //     contactInfo.contactID,
  //     text,
  //     flags,
  //     messageID,
  //     isReciever,
  //     Date.now(),
  //     contactInfo.lastMessageIndex + 1
  //   );

  //   updateContactInfo({
  //     ...contactInfo,
  //     lastMessageIndex: contactInfo.lastMessageIndex + 1,
  //   });

  //   // local message cache
  //   const updatedMessagesRecieved = new Map(messagesRecieved);
  //   updatedMessagesRecieved.set(
  //     contactInfo.contactID,
  //     getMessagesFromStorage(contactInfo.contactID, contactInfo.lastMessageIndex + 1)
  //   );
  //   setMessagesRecieved(updatedMessagesRecieved);

  //   // check for new contact
  //   setAllUsers(getArrayOfConvos());
  // };

  const initializeAllConvos = () => {
    const allConvos = getArrayOfConvos();
    const allMessagesMap: Map<string, Message[]> = new Map();

    for (let i = 0; i < allConvos.length; i++) {
      const contactInfo = getOrCreateContactInfo(allConvos[i]);
      allMessagesMap.set(
        allConvos[i],
        getMessagesFromStorage(allConvos[i], contactInfo.lastMessageIndex)
      );
    }

    setMessagesRecieved(allMessagesMap);
  };

  return (
    <>
      {userInfo !== null ? (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
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
