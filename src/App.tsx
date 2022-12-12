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
  allContactsAtom,
  conversationCacheAtom,
} from './services/atoms';
import { createListeners, startSDK } from './services/bridgefy-link';
import {
  getContactInfo,
  isContact,
  logDisconnect,
  setContactInfo,
  updateContactInfo,
} from './services/database/contacts';
import {
  addContactToArray,
  ContactInfo,
  createConversationCache,
  getContactsArray,
  RawMessage,
  updateConversationCache,
} from './services/database/database';
import {
  createNewMessage,
  fetchMessage,
  getConversationHistory,
  setMessageWithID,
} from './services/database/messages';
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
  const [conversationCache, setConversationCache] = useAtom(conversationCacheAtom);
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
    setConversationCache(createConversationCache());
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
    console.log('(onMessageSent) Successfully dispatched message:', messageID);

    // update message status to success
    const message = fetchMessage(messageID);
    setMessageWithID(messageID, {
      ...message,
      statusFlag: 0,
    });

    // update conversation cache
    setConversationCache(
      updateConversationCache(
        message.contactID,
        getConversationHistory(message.contactID),
        new Map(conversationCache)
      )
    );
  };

  // called when a message fails to send
  const onMessageSentFailed = (messageID: string, error: string) => {
    console.log('(onMessageSentFailed) Message was pending, saving as failed.', messageID);
    console.log('(onMessageSentFailed) Error:', error);

    // update message status to failed
    const message = fetchMessage(messageID);
    setMessageWithID(messageID, {
      ...message,
      statusFlag: 2,
    });

    // update conversation cache
    setConversationCache(
      updateConversationCache(
        message.contactID,
        getConversationHistory(message.contactID),
        new Map(conversationCache)
      )
    );
  };

  // called when a message is received
  const onMessageReceived = (contactID: string, messageID: string, raw: string) => {
    if (!contactID || !messageID || !raw) {
      console.log(contactID, messageID, raw);
      throw new Error('(addRecievedMessageToStorage) Message misformed'); // remove this once in production, security risk
    }

    let contactInfo: ContactInfo;
    if (!isContact(contactID)) {
      contactInfo = setContactInfo(contactID, {
        contactID: contactID,
        username: '',
        nickname: contactID,
        contactFlags: 0,
        verified: false, // used in future versions
        lastSeen: -1,
      });

      // add new contact to contacts array
      const contacts = addContactToArray(contactID);
      setAllUsers(contacts);
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

    // nickname change
    if (parsedMessage.flags === 1) {
      console.log('(onMessageReceived) Nickname change for', contactInfo.contactID);
      updateContactInfo(contactID, {
        ...contactInfo,
        nickname: parsedMessage.content,
      });
      setAllUsers(getContactsArray()); // cause the conversations page to rerender
      removeConnection(''); // cause the contact page to rerender
    }

    createNewMessage(contactID, messageID, {
      messageID,
      contactID,
      isReceiver: true,
      typeFlag: parsedMessage.flags,
      statusFlag: 0, // received successfully
      content: parsedMessage.content,
      createdAt: parsedMessage.createdAt, // unix timestamp
      receivedAt: Date.now(), // unix timestamp
    });

    // update conversation cache
    setConversationCache(
      updateConversationCache(
        contactID,
        getConversationHistory(contactID),
        new Map(conversationCache)
      )
    );
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
