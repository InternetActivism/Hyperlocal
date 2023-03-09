/* eslint-disable react-hooks/exhaustive-deps */
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAtom } from 'jotai';
import React, { useEffect } from 'react';
import { LoadingPage, ProfilePage, TabNavigator } from './pages';
import { ChatPage } from './pages/Chat';
import {
  addConnectionAtom,
  allContactsAtom,
  bridgefyStatusAtom,
  connectionInfoAtomInterface,
  conversationCacheAtom,
  createConversationCache,
  currentUserInfoAtom,
  getActiveConnectionsAtom,
  publicChatCacheAtom,
  removeConnectionAtom,
  updateConversationCacheDeprecated,
} from './services/atoms';
import { createListeners, getUserId, startSDK } from './services/bridgefy-link';
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
  PublicChatMessagePacket,
  sendChatInvitationResponseWrapper,
  TextMessagePacket,
} from './services/transmission';
import {
  checkUpToDateName,
  checkUpToDateNameAll,
  getOrCreateUserInfoDatabase,
  getUserInfoDatabase,
  setUserInfoDatabase,
} from './services/user';
import { vars } from './utils/theme';
import {
  BridgefyErrors,
  BridgefyStates,
  MessageStatus,
  MessageType,
  NULL_UUID,
} from './utils/globals';
import {
  doesPublicMessageExist,
  fetchPublicMessage,
  getOrCreatePublicChatDatabase,
  getPublicChatConversation,
  savePublicChatMessageToStorage,
  setPublicChatInfo,
  setPublicMessageWithID,
} from './services/public_chat';
import { PublicChatPage } from './pages/PublicChatPage';

export default function App() {
  // Information about the app user which is both stored in the database and loaded into memory.
  const [userInfo, setUserInfo] = useAtom(currentUserInfoAtom);

  // Connection info is a map of connection IDs to connection info (name, last seen, etc.) that is temporarily stored in memory.
  const [connectionInfo, setConnectionInfo] = useAtom(connectionInfoAtomInterface);

  // Connections is a list of all active connections that is temporarily stored in memory.
  const [connections] = useAtom(getActiveConnectionsAtom);
  const [, addConnection] = useAtom(addConnectionAtom); // Atomic operation to add a connection to the list of active connections.
  const [, removeConnection] = useAtom(removeConnectionAtom); // Atomic operation to remove a connection from the list of active connections.

  // Conversation cache is a map of contact IDs to conversation histories that is temporarily stored in memory.
  const [conversationCache, setConversationCache] = useAtom(conversationCacheAtom);

  // Public chat conversation cache.
  const [, setPublicChatCache] = useAtom(publicChatCacheAtom);

  // All users is a list of all contacts that is temporarily stored in memory, we also store this in the database and just load it into memory on app initialization.
  const [, setAllUsers] = useAtom(allContactsAtom);

  // Bridgefy status is a string that is used to determine the current state of the Bridgefy SDK.
  const [, setBridgefyStatus] = useAtom(bridgefyStatusAtom);

  // Navigation stack.
  const Stack = createNativeStackNavigator();

  /*

    HOOKS

  */

  // Runs on app initialization.
  useEffect(() => {
    console.log('(initialization) WARNING: Starting app...');
    createListeners(
      onStart,
      onFailedToStart,
      onStop,
      onFailedToStop,
      onConnect,
      onDisconnect,
      onEstablishedSecureConnection,
      onFailedToEstablishSecureConnection,
      onMessageReceived,
      onMessageSent,
      onMessageSentFailed
    );
    setBridgefyStatus(BridgefyStates.STARTING);
    startSDK()
      .then(() => {
        getUserId()
          .then((userID: string) => {
            onBridgefyInit(userID);
          })
          .catch((error: number) => {
            handleBridgefyError(error);
          });
      })
      .catch((error: number) => {
        handleBridgefyError(error);
      });
    setAllUsers(getContactsArray());
    setConversationCache(createConversationCache());
    getOrCreatePublicChatDatabase();
    setPublicChatCache({ history: getPublicChatConversation(), lastUpdated: Date.now() });
  }, []);

  // Runs on every userInfo update.
  // Checks if all connections have user's updated nickname.
  useEffect(() => {
    console.log('(App) User info update:', userInfo);
    if (userInfo) {
      checkUpToDateNameAll(userInfo, connections);
    }
  }, [userInfo]);

  /*

    HELPER FUNCTIONS

    Some helpful functions that are used in the event listeners.

  */

  const handleBridgefyError = (error: number) => {
    switch (error) {
      case BridgefyErrors.LICENCE_ERROR:
      case BridgefyErrors.INTERNET_CONNECTION_REQUIRED:
        setBridgefyStatus(BridgefyStates.REQUIRES_WIFI);
        break;
      case BridgefyErrors.BLE_USAGE_NOT_GRANTED:
        setBridgefyStatus(BridgefyStates.BLUETOOTH_PERMISSION_REJECTED);
        break;
      case BridgefyErrors.BLE_POWERED_OFF:
        setBridgefyStatus(BridgefyStates.BLUETOOTH_OFF);
        break;
      case BridgefyErrors.SIMULATOR_NOT_SUPPORTED:
        // If we are running on a simulator, use sample data
        const newUser = getOrCreateUserInfoDatabase('698E84AE-67EE-4057-87FF-788F88069B68', false);
        setUserInfoDatabase(newUser);
        setUserInfo(newUser);
        addConnection('55507E96-B4A2-404F-8A37-6A3898E3EC2B');
        addConnection('93f45b0a-be57-453a-9065-86320dda99db');
        break;
      case BridgefyErrors.UNKNOWN_ERROR:
        setBridgefyStatus(BridgefyStates.FAILED);
        throw new Error('(handleBridgefyError) Unknown Bridgefy error occurred');
      default:
        setBridgefyStatus(BridgefyStates.FAILED);
    }
  };

  const onBridgefyInit = (userID: string) => {
    console.log('(onBridgefyInit) Starting with user ID:', userID);
    getOrCreatePublicChatDatabase();
    setUserInfo(getOrCreateUserInfoDatabase(userID, true)); // mark sdk as validated
    setBridgefyStatus(BridgefyStates.ONLINE);
  };

  /*

    EVENT LISTENERS

    None of these can access atoms directly for some reason, but they can used as setters? Maybe? What the fuck who knows.
    Lots of testing needed, Jotai seems to be a bit buggy.
    Basically, do not trust any atoms in the listener functions. Trust the database instead.
    We need to do some race condition testing in the future here.

  */

  // Runs on Bridgefy SDK start.
  const onStart = () => {
    console.log('(onStart) Started Bridgefy');
    setBridgefyStatus(BridgefyStates.ONLINE);
  };

  // Runs on Bridgefy SDK start failure.
  const onFailedToStart = (error: string) => {
    console.log('(onFailedToStart) Failed to start:', error);

    const errorCode: number = parseInt(error, 10);
    handleBridgefyError(errorCode);
  };

  // Runs on Bridgefy SDK stop.
  const onStop = () => {
    console.log('(onStop) Stopped');
    setBridgefyStatus(BridgefyStates.OFFLINE);
  };

  // Runs on Bridgefy SDK stop failure.
  const onFailedToStop = (error: string) => {
    console.log('(onFailedToStop) Failed to stop:', error);
    setBridgefyStatus(BridgefyStates.FAILED);
  };

  // Runs on connection to another user.
  // Remember that we connect with many people who are not in our contacts and we will not speak to.
  // We currently send "ConnectionInfo" to all connections to share our nickname.
  const onConnect = (connectedID: string) => {
    console.log('(onConnect) Connected:', connectedID);

    // Check if this is a valid connection.
    if (connectedID === NULL_UUID) {
      console.log('(onConnect) CORRUPTED CONNECTION', connectedID);
      return;
    }

    // Add connection to our list of active connections.
    addConnection(connectedID);

    // Check if this connection has our updated nickname.
    // We should be able to get this from Jotai, but it's not working for some reason.
    // This is probably related to the scope of this function and it being called via the listener.
    // For now we will just get it from the database.
    const user = getUserInfoDatabase();
    if (user) {
      checkUpToDateName(connectedID, user);
    }

    // We already update the last seen on disconnect, but sometimes clients don't disconnect properly.
    if (isContact(connectedID)) {
      console.log('(onConnect) Updating last seen for contact:', getContactInfo(connectedID));
      updateLastSeen(connectedID);
    }
  };

  const onDisconnect = (connectedID: string) => {
    console.log('(onDisconnect) Disconnected:', connectedID);

    // Check if this is a valid connection.
    if (connectedID === NULL_UUID) {
      console.log('(onDisconnect) CORRUPTED CONNECTION, Bridgefy error.', connectedID);
      return;
    }

    // Remove connection from our list of active connections.
    removeConnection(connectedID);

    // Update last seen for contact.
    if (isContact(connectedID)) {
      updateLastSeen(connectedID);
    }
  };

  // Runs when a secure connection with a user is established
  const onEstablishedSecureConnection = (connectedID: string) => {
    console.log('(onEstablishedSecureConnection) Secure connection established with:', connectedID);
  };

  // Runs when a secure connection cannot be made
  const onFailedToEstablishSecureConnection = (connectedID: string, error: string) => {
    console.log(
      '(onFailedToEstablishSecureConnection) Failed to establish secure connection with:',
      connectedID,
      'with error:',
      error
    );
  };

  // Runs on message successfully dispatched, does not mean it was received by the recipient.
  const onMessageSent = (messageID: string) => {
    console.log('(onMessageSent) Successfully dispatched message:', messageID);

    // Check if this is a valid connection.
    if (messageID === NULL_UUID) {
      console.log('(onMessageSent) CORRUPTED MESSAGE, Bridgefy error.', messageID);
      return;
    }

    // Check if this is a direct message to a contact in our database.
    if (doesMessageExist(messageID)) {
      // Get message from database, where it was saved as pending.
      // Update message status to success.
      const message = fetchMessage(messageID);
      setMessageWithID(messageID, {
        ...message,
        statusFlag: MessageStatus.SUCCESS,
      });

      // Update the local conversation cache, which is used to display messages. This causes a re-render.
      // This may be broken as it's using a Jotai setter.
      // This also might create a race condition in the future, we'll need to test.
      setConversationCache(
        updateConversationCacheDeprecated(
          message.contactID,
          getConversationHistory(message.contactID),
          new Map(conversationCache)
        )
      );
    } else if (doesPublicMessageExist(messageID)) {
      // Get message from public chat database, where it was saved as pending.
      // Update message status to success.
      const message = fetchPublicMessage(messageID);
      setPublicMessageWithID(messageID, {
        ...message,
        statusFlag: MessageStatus.SUCCESS,
      });

      // TODO: Cause a re-render on Public Chat page.
    } else {
      // Sometimes Bridgefy will send messages automatically, we don't want to consider these messages.
      console.log('(onMessageSent) Message sent automatically, not saving.');
      return;
    }
  };

  // Runs on message failure to dispatch.
  const onMessageSentFailed = (messageID: string, error: string) => {
    console.log('(onMessageSentFailed) Message failed to send, error:', error);

    // Get message from database, where it was saved as pending.
    // Update message status to failed.
    const message = fetchMessage(messageID);
    setMessageWithID(messageID, {
      ...message,
      statusFlag: MessageStatus.FAILED,
    });

    // Update the local conversation cache, which is used to display messages.
    // This may be broken as it's using a Jotai setter.
    // This also might create a race condition in the future, we'll need to test.
    setConversationCache(
      updateConversationCacheDeprecated(
        message.contactID,
        getConversationHistory(message.contactID),
        new Map(conversationCache)
      )
    );
  };

  // Runs on message received.
  const onMessageReceived = (
    contactID: string,
    messageID: string,
    raw: string,
    transmission: string
  ) => {
    console.log('(onMessageReceived) Received message:', contactID, messageID, raw, transmission);

    // Sometimes we'll receive corrupted messages, so we don't want to crash the app.
    if (messageID === NULL_UUID || contactID === NULL_UUID || !contactID || !messageID || !raw) {
      console.log('(onMessageReceived) CORRUPTED MESSAGE', contactID, messageID, raw);
      return;
    }

    // Check that we have initialized the user.
    const user = getUserInfoDatabase();
    if (!user) {
      throw new Error('(onMessageReceived) No personal user info');
    }

    // A parsed message is polymorphic, it can be any of the message types.
    // See possible types in the transmission.ts file.
    // Sometimes we'll receive corrupted messages, so we don't want to crash the app.
    let parsedMessage: Message;
    try {
      parsedMessage = JSON.parse(raw);
    } catch (e) {
      console.log(raw);
      console.log('(onMessageReceived) Not JSON, corrupted message. Bridgefy error or attack.');
      return;
    }

    // Depending on the type of message, we will handle it differently.
    switch (parsedMessage.flags) {
      // A text chat message is the most common type of message.
      case MessageType.TEXT:
        console.log('(onMessageRecieved) Received TEXT message');
        {
          parsedMessage = parsedMessage as TextMessagePacket;

          // We should only receive messages from contacts that we have started a chat with.
          // Ignore people trying to send us a message if we haven't added them.
          if (!isContact(contactID)) {
            console.log('(onMessageReceived) Received message from non-contact:', contactID);
            return;
          }

          // Since we know that the contact is valid, we can get their info.
          // getContactInfo is an unsafe operation, it'll fail if the contact doesn't exist.
          // This is not needed for the message to be saved, but it's useful for debugging.
          const contactInfo = getContactInfo(contactID);
          console.log('(onMessageReceived) New message from', contactInfo.nickname);

          // Save the message to the database.
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
      case MessageType.PUBLIC_CHAT_MESSAGE:
        console.log('(onMessageRecieved) Received PUBLIC_CHAT_MESSAGE message');

        parsedMessage = parsedMessage as PublicChatMessagePacket;

        // Since we know that the contact is valid, we can get their info.
        // getContactInfo is an unsafe operation, it'll fail if the contact doesn't exist.
        // This is not needed for the message to be saved, but it's useful for debugging.
        console.log('(onMessageReceived) New public chat message from', parsedMessage.nickname);

        // Save the message to the database.
        savePublicChatMessageToStorage(messageID, {
          messageID,
          senderID: contactID,
          nickname: parsedMessage.nickname,
          isReceiver: true,
          statusFlag: MessageStatus.SUCCESS, // received successfully
          content: parsedMessage.message,
          createdAt: parsedMessage.createdAt, // unix timestamp
          receivedAt: Date.now(), // unix timestamp
        });

        // TODO: Cause a re-render on Public Chat page.

        break;
      case MessageType.NICKNAME_UPDATE:
        console.log('Received NICKNAME_UPDATE message');
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

          // Update the local conversation cache, which is used to display messages.
          // This may be broken as it's using a Jotai setter.
          // This also might create a race condition in the future, we'll need to test.
          setConversationCache(
            updateConversationCacheDeprecated(
              contactID,
              getConversationHistory(contactID),
              new Map(conversationCache)
            )
          );
        }
        break;
      // A connection info message is sent when another user is in your area.
      // It contains their public name, which is used to identify them before you add them.
      case MessageType.PUBLIC_INFO:
        console.log('Received PUBLIC_INFO message');
        parsedMessage = parsedMessage as ConnectionInfoPacket;

        // Save connection info temporarily to a cache.
        setConnectionInfo({
          contactID: contactID,
          publicName: parsedMessage.publicName,
          lastUpdated: Date.now(),
        });

        // Force the contact page to rerender.
        removeConnection('');

        break;
      // A chat invitation is sent when a user wants to start a chat with you.
      // For now we'll just accept all invitations, but in the future we'll add a UI element.
      // This logic will be substantially different in the future.
      case MessageType.CHAT_INVITATION:
        console.log('Received CHAT_INVITATION message');
        parsedMessage = parsedMessage as ChatInvitationPacket;

        // Accept the invitation, inclduing the confirmation hash used to verify the invitation.
        sendChatInvitationResponseWrapper(
          contactID,
          user.nickname,
          parsedMessage.requestHash,
          true
        );

        // Create a new contact in the database, which correlates with a new conversation.
        // The user attaches personal information along with the invitation.
        console.log('(onMessageReceived) New contact:', contactID);
        setContactInfo(contactID, {
          contactID: contactID,
          nickname: parsedMessage.nickname,
          contactFlags: 0, // used in future versions
          verified: false, // used in future versions
          lastSeen: Date.now(),
        });

        // Add the new contact to the list of contacts in both the database and the local state.
        setAllUsers(addContactToArray(contactID));

        break;
      // A chat invitation response is sent when a user accepts or rejects your invitation.
      case MessageType.CHAT_INVITATION_RESPONSE:
        console.log('Received CHAT_INVITATION_RESPONSE message');
        parsedMessage = parsedMessage as ChatInvitationPacket;

        // Check that this is a valid invitation response.
        // This is a security measure to prevent people from sending fake responses, which could be used to spam users.
        // The hash is somewhat redundant due to the fact that we can verify the sender, but it may be useful in the future.
        const validInvitation = verifyChatInvitation(contactID, parsedMessage.requestHash);
        if (!validInvitation) {
          console.log('(onMessageReceived) Invalid chat invitation response from:', contactID);
          return;
        }

        // If the invitation was accepted, create a new contact in the database.
        if (parsedMessage.accepted) {
          console.log('(onMessageReceived) New contact:', contactID);

          // Create a new contact in the database, which correlates with a new conversation.
          setContactInfo(contactID, {
            contactID: contactID,
            nickname: getConnectionName(contactID, connectionInfo),
            contactFlags: 0, // used in future versions
            verified: false, // used in future versions
            lastSeen: Date.now(),
          });

          // Add the new contact to the list of contacts in both the database and the local state.
          setAllUsers(addContactToArray(contactID));
        } else {
          // If the invitation was rejected, do nothing.
          // We could add a UI element to notify the user that the invitation was rejected.
          // We also could delete the invitation from the database, but it's not super necessary.
          console.log('(onMessageReceived) Chat invitation rejected by:', contactID);
        }

        break;
      default:
        console.log('(onMessageReceived) Unknown message type:', parsedMessage.flags);
        return;
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Loading"
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: vars.backgroundColor,
          },
        }}
      >
        <Stack.Screen name="Loading" component={LoadingPage} />
        <Stack.Screen name="Home" component={TabNavigator} options={{ animation: 'fade' }} />
        <Stack.Screen name="Profile" component={ProfilePage} />
        <Stack.Screen name="Chat" component={ChatPage} />
        <Stack.Screen name="PublicChat" component={PublicChatPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
