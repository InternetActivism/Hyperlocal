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
  connectionInfoAtomInterface,
  bridgefyStatusAtom,
  createConversationCache,
  updateConversationCacheDeprecated,
} from './services/atoms';
import { createListeners, startSDK } from './services/bridgefy-link';
import { verifyChatInvitation } from './services/chat_invitations';
import { getConnectionName } from './services/connections';
import {
  addContactToArray,
  getContactInfo,
  getContactsArray,
  isContact,
  setContactInfo,
  updateContactInfo,
  updateLastSeen,
} from './services/contacts';
import {
  doesMessageExist,
  fetchMessage,
  getConversationHistory,
  saveChatMessageToStorage,
  setMessageWithID,
} from './services/stored_messages';
import {
  ChatInvitationPacket,
  ConnectionInfoPacket,
  Message,
  NicknameUpdatePacket,
  sendChatInvitationResponseWrapper,
  TextMessagePacket,
} from './services/transmission';
import {
  checkUpToDateName,
  checkUpToDateNameAll,
  getOrCreateUserInfo,
  getUserInfo,
} from './services/user';
import { BridgefyStates, MessageStatus, MessageType, NULL_UUID } from './utils/globals';

export default function App() {
  const [userInfo, setUserInfo] = useAtom(currentUserInfoAtom);
  const [connections] = useAtom(getActiveConnectionsAtom);
  const [, addConnection] = useAtom(addConnectionAtom);
  const [, removeConnection] = useAtom(removeConnectionAtom);
  const [conversationCache, setConversationCache] = useAtom(conversationCacheAtom);
  const [, setAllUsers] = useAtom(allContactsAtom);
  const [connectionInfo, setConnectionInfo] = useAtom(connectionInfoAtomInterface);
  const [, setBridgefyStatus] = useAtom(bridgefyStatusAtom);

  const Stack = createNativeStackNavigator();

  /*

    HOOKS

  */

  useEffect(() => {
    console.log('(initialization) WARNING: Starting app...');
    createListeners(
      onStart,
      onFailedToStart,
      onConnect,
      onDisconnect,
      onMessageReceived,
      onMessageSent,
      onMessageSentFailed
    );
    setBridgefyStatus(BridgefyStates.STARTING);
    startSDK();
    setAllUsers(getContactsArray());
    setConversationCache(createConversationCache());
  }, []);

  // check if user's name is up to date with all connections when user info is changed/loaded
  useEffect(() => {
    console.log('(App) User info update:', userInfo);
    if (userInfo) {
      checkUpToDateNameAll(userInfo, connections);
    }
  }, [userInfo]);

  useEffect(() => {
    console.log('(App) Connections update:', connections);
  }, [connections]);

  /*

    EVENT LISTENERS

    None of these can access atoms directly for some reason, but they can used as setters? Maybe? What the fuck who knows.
    Lots of testing needed, jotai seems to be a bit buggy.
    Handle all atom update logic in jotai.

  */

  const onStart = (userID: string) => {
    console.log('(onStart) Starting with user ID:', userID);
    setUserInfo(getOrCreateUserInfo(userID, true)); // mark sdk as validated
    setBridgefyStatus(BridgefyStates.STARTING);
  };

  const onFailedToStart = (error: string) => {
    console.log('(onFailedToStart) Failed to start:', error);
    setBridgefyStatus(BridgefyStates.FAILED);
  };

  // remember that we connect with many people who are not in our contacts and we will not speak to
  // not all connections will be or should be in our contacts
  const onConnect = (connectedID: string) => {
    console.log('(onConnect) Connected:', connectedID);

    if (connectedID === NULL_UUID) {
      console.log('(onConnect) CORRUPTED CONNECTION', connectedID);
      return;
    }

    addConnection(connectedID);

    // check whether connected user has our updated name
    const user = getUserInfo();
    if (user) {
      checkUpToDateName(connectedID, user);
    }

    // we already do this on disconnect, but sometimes clients don't disconnect properly
    // we also only update last seen for contacts
    if (isContact(connectedID)) {
      console.log('(onConnect) Updating last seen for contact:', getContactInfo(connectedID));
      updateLastSeen(connectedID);
    }
  };

  const onDisconnect = (connectedID: string) => {
    console.log('(onDisconnect) Disconnected:', connectedID);

    if (connectedID === NULL_UUID) {
      // remove once proved unnecessary
      console.log('(onDisconnect) CORRUPTED CONNECTION', connectedID);
      return;
    }

    removeConnection(connectedID);
    if (isContact(connectedID)) {
      updateLastSeen(connectedID);
    }
  };

  // called when a message is successfully sent out
  const onMessageSent = (messageID: string) => {
    console.log('(onMessageSent) Successfully dispatched message:', messageID);

    if (messageID === NULL_UUID) {
      // remove once proved unnecessary
      console.log('(onMessageSent) CORRUPTED MESSAGE', messageID);
      throw new Error('Corrupted message');
    }

    if (!doesMessageExist(messageID)) {
      console.log('(onMessageSent) Message sent automatically, not saving.');
      return;
    }

    // update message status to success
    const message = fetchMessage(messageID);
    setMessageWithID(messageID, {
      ...message,
      statusFlag: MessageStatus.SUCCESS,
    });

    // update conversation cache
    // this might just be totally broken bc of how jotai works
    // also race condition
    setConversationCache(
      updateConversationCacheDeprecated(
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
      statusFlag: MessageStatus.FAILED,
    });

    // update conversation cache
    // this might just be totally broken bc of how jotai works
    // also race condition
    setConversationCache(
      updateConversationCacheDeprecated(
        message.contactID,
        getConversationHistory(message.contactID),
        new Map(conversationCache)
      )
    );
  };

  // called when a message is received
  const onMessageReceived = (contactID: string, messageID: string, raw: string) => {
    console.log('(onMessageReceived) Received message:', contactID, messageID, raw);

    if (messageID === NULL_UUID || contactID === NULL_UUID || !contactID || !messageID || !raw) {
      // remove once proved unnecessary
      console.log('(onMessageReceived) CORRUPTED MESSAGE', contactID, messageID, raw);
      return;
    }

    if (!userInfo) {
      console.log(userInfo);
      throw new Error('(onMessageReceived) No personal user info');
    }

    let parsedMessage: Message;
    try {
      parsedMessage = JSON.parse(raw);
    } catch (e) {
      console.log(raw);
      console.log('(onMessageReceived) Not JSON, corrupted message. Bridgefy error or attack.');
      return null;
    }

    switch (parsedMessage.flags) {
      case MessageType.TEXT:
        {
          parsedMessage = parsedMessage as TextMessagePacket;
          if (!isContact(contactID)) {
            console.log('(onMessageReceived) Received message from non-contact:', contactID);
            return;
          }

          const contactInfo = getContactInfo(contactID);
          console.log('(onMessageReceived) New message from', contactInfo.contactID);

          saveChatMessageToStorage(contactID, messageID, {
            messageID,
            contactID,
            isReceiver: true,
            typeFlag: parsedMessage.flags,
            statusFlag: MessageStatus.SUCCESS, // received successfully
            content: parsedMessage.message,
            createdAt: parsedMessage.createdAt, // unix timestamp
            receivedAt: Date.now(), // unix timestamp
          });

          setConversationCache(
            updateConversationCacheDeprecated(
              contactID,
              getConversationHistory(contactID),
              new Map(conversationCache)
            )
          );
        }
        break;
      case MessageType.NICKNAME_UPDATE:
        {
          parsedMessage = parsedMessage as NicknameUpdatePacket;

          if (!isContact(contactID)) {
            console.log(
              '(onMessageReceived) Received nickname update from non-contact:',
              contactID
            );
            return;
          }

          const contactInfo = getContactInfo(contactID);
          console.log('(onMessageReceived) Nickname change for', contactInfo.contactID);
          updateContactInfo(contactID, {
            ...contactInfo,
            nickname: parsedMessage.nickname,
          });
          setAllUsers(getContactsArray()); // cause the conversations page to rerender
          removeConnection(''); // cause the contact page to rerender

          saveChatMessageToStorage(contactID, messageID, {
            messageID,
            contactID,
            isReceiver: true,
            typeFlag: parsedMessage.flags,
            statusFlag: MessageStatus.SUCCESS, // received successfully
            content: parsedMessage.nickname,
            createdAt: parsedMessage.createdAt, // unix timestamp
            receivedAt: Date.now(), // unix timestamp
          });

          setConversationCache(
            updateConversationCacheDeprecated(
              contactID,
              getConversationHistory(contactID),
              new Map(conversationCache)
            )
          );
        }
        break;
      case MessageType.PUBLIC_INFO:
        parsedMessage = parsedMessage as ConnectionInfoPacket;

        // this just means you're receiving a connection's info message that is only for temporary storage
        // just lets you see their nickname before you add them
        setConnectionInfo({
          contactID: contactID,
          publicName: parsedMessage.publicName,
          lastUpdated: Date.now(),
        });
        removeConnection(''); // cause the contact page to rerender
        break;
      case MessageType.CHAT_INVITATION:
        parsedMessage = parsedMessage as ChatInvitationPacket;

        // temporary logic to always instantly accept chat invitations
        // in the future, we'll add a UI element to accept or reject chat invitations

        sendChatInvitationResponseWrapper(contactID, parsedMessage.requestHash, true);

        console.log('(onMessageReceived) New contact:', contactID);
        setContactInfo(contactID, {
          contactID: contactID,
          nickname: getConnectionName(contactID, connectionInfo),
          contactFlags: 0,
          verified: false, // used in future versions
          lastSeen: Date.now(),
        });

        // add new contact to contacts array
        setAllUsers(addContactToArray(contactID));
        break;
      case MessageType.CHAT_INVITATION_RESPONSE:
        parsedMessage = parsedMessage as ChatInvitationPacket;

        const validInvitation = verifyChatInvitation(contactID, parsedMessage.requestHash);
        if (!validInvitation) {
          console.log('(onMessageReceived) Invalid chat invitation response from:', contactID);
          return;
        }

        if (parsedMessage.accepted) {
          console.log('(onMessageReceived) New contact:', contactID);
          setContactInfo(contactID, {
            contactID: contactID,
            nickname: getConnectionName(contactID, connectionInfo),
            contactFlags: 0, // used in future versions
            verified: false, // used in future versions
            lastSeen: Date.now(),
          });

          setAllUsers(addContactToArray(contactID));
        } else {
          console.log('(onMessageReceived) Chat invitation rejected by:', contactID);
        }

        break;
      default:
        console.log('(onMessageReceived) Unknown message type:', parsedMessage.flags);
        return;
    }
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
