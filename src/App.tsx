/* eslint-disable react-hooks/exhaustive-deps */
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAtom } from 'jotai';
import * as React from 'react';
import { useEffect, useState } from 'react';
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
  removeConnectionAtom,
  updateConversationCacheDeprecated,
  updateUnreadCount,
} from './services/atoms';
import { getUserId, linkListenersToEvents, startSDK } from './services/bridgefy-link';
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
  updateUnreadCountStorage,
} from './services/contacts';
import {
  doesMessageExist,
  fetchMessage,
  getConversationHistory,
  saveChatMessageToStorage,
  setMessageWithID,
} from './services/stored_messages';
import { Message, sendChatInvitationResponseWrapper } from './services/transmission';
import {
  checkUpToDateName,
  checkUpToDateNameAll,
  getOrCreateUserInfoDatabase,
  getUserInfoDatabase,
  setUserInfoDatabase,
} from './services/user';
import {
  BridgefyErrors,
  BridgefyStates,
  ConnectData,
  DisconnectData,
  EstablishedSecureConnectionData,
  EventData,
  EventPacket,
  EventType,
  FailedToEstablishSecureConnectionData,
  FailedToStartData,
  FailedToStopData,
  MessageReceivedData,
  MessageSentData,
  MessageSentFailedData,
  MessageStatus,
  NULL_UUID,
  StartData,
  StopData,
} from './utils/globals';
import {
  isMessageChatInvitation,
  isMessageChatInvitationResponse,
  isMessageNicknameUpdate,
  isMessagePublicInfo,
  isMessageText,
} from './utils/getMessageType';
import { vars } from './utils/theme';

export type RootStackParamList = {
  Loading: undefined;
  Home: undefined;
  Profile: undefined;
  Chat: { user: string };
};

function isChatProps(props: any): props is RootStackParamList['Chat'] {
  return props.user !== undefined;
}

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

  // All users is a list of all contacts that is temporarily stored in memory, we also store this in the database and just load it into memory on app initialization.
  const [, setAllUsers] = useAtom(allContactsAtom);

  // Bridgefy status is a string that is used to determine the current state of the Bridgefy SDK.
  const [, setBridgefyStatus] = useAtom(bridgefyStatusAtom);

  // The current contact the user is chatting with.
  const [chatContact, setChatContact] = useState<string>('');

  // Bridgefy events.
  const [event, setEvent] = useState<EventPacket | null>(null);

  // Navigation stack.
  const Stack = createNativeStackNavigator<RootStackParamList>();

  // Reference to the navigation container.
  const navigationRef = createNavigationContainerRef();

  /*

    HOOKS

  */

  // useEffect(() => {
  //   const interval = setInterval(async () => {
  //     const peers = await getConnectedPeers();
  //     console.log(peers);
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, []);

  // Runs on app initialization.
  useEffect(() => {
    console.log('(initialization) WARNING: Starting app...');
    linkListenersToEvents(handleEvent);
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
  }, []);

  // Runs on every userInfo update.
  // Checks if all connections have user's updated nickname.
  useEffect(() => {
    console.log('(App) User info update:', userInfo);
    if (userInfo) {
      checkUpToDateNameAll(userInfo, connections);
    }
  }, [userInfo]);

  // Handles all events from the Bridgefy link.
  useEffect(() => {
    if (!event) {
      return;
    }
    const listenerFunction: (data: EventData) => void = eventListeners[event.type];
    listenerFunction(event.data);
  }, [event]);

  /*

    HELPER FUNCTIONS

    Some helpful functions that are used in the event listeners.

  */

  const handleEvent = (packet: EventPacket) => {
    setEvent(packet);
  };

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

  const eventListeners: { [key in EventType]: (data: any) => void } = {
    [EventType.START]: onStart,
    [EventType.FAILED_TO_START]: onFailedToStart,
    [EventType.STOP]: onStop,
    [EventType.FAILED_TO_STOP]: onFailedToStop,
    [EventType.CONNECT]: onConnect,
    [EventType.DISCONNECT]: onDisconnect,
    [EventType.ESTABLISHED_SECURE_CONNECTION]: onEstablishedSecureConnection,
    [EventType.FAILED_TO_ESTABLISH_SECURE_CONNECTION]: onFailedToEstablishSecureConnection,
    [EventType.MESSAGE_RECEIVED]: onMessageReceived,
    [EventType.MESSAGE_SENT]: onMessageSent,
    [EventType.MESSAGE_SENT_FAILED]: onMessageSentFailed,
  };

  const onBridgefyInit = (userID: string) => {
    console.log('(onBridgefyInit) Starting with user ID:', userID);
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function onStart(data: StartData) {
    console.log('(onStart) Started Bridgefy');
    setBridgefyStatus(BridgefyStates.ONLINE);
  }

  // Runs on Bridgefy SDK start failure.
  function onFailedToStart(data: FailedToStartData) {
    const error: string = data.error;

    console.log('(onFailedToStart) Failed to start:', error);

    const errorCode: number = parseInt(error, 10);
    handleBridgefyError(errorCode);
  }

  // Runs on Bridgefy SDK stop.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function onStop(data: StopData) {
    console.log('(onStop) Stopped');
    setBridgefyStatus(BridgefyStates.OFFLINE);
  }

  // Runs on Bridgefy SDK stop failure.
  function onFailedToStop(data: FailedToStopData) {
    const error: string = data.error;

    console.log('(onFailedToStop) Failed to stop:', error);
    setBridgefyStatus(BridgefyStates.FAILED);
  }

  // Runs on connection to another user.
  // Remember that we connect with many people who are not in our contacts and we will not speak to.
  // We currently send "ConnectionInfo" to all connections to share our nickname.
  function onConnect(data: ConnectData) {
    const connectedID: string = data.userID;

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

    // This should never be null, remove once certain.
    const user = getUserInfoDatabase();
    if (user) {
      checkUpToDateName(connectedID, user);
    }

    // We already update the last seen on disconnect, but sometimes clients don't disconnect properly.
    if (isContact(connectedID)) {
      console.log('(onConnect) Updating last seen for contact:', getContactInfo(connectedID));
      updateLastSeen(connectedID);
    }
  }

  function onDisconnect(data: DisconnectData) {
    const connectedID: string = data.userID;

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
  }

  // Runs when a secure connection with a user is established
  function onEstablishedSecureConnection(data: EstablishedSecureConnectionData) {
    const connectedID: string = data.userID;
    console.log('(onEstablishedSecureConnection) Secure connection established with:', connectedID);
  }

  // Runs when a secure connection cannot be made
  function onFailedToEstablishSecureConnection(data: FailedToEstablishSecureConnectionData) {
    const connectedID: string = data.userID;
    const error: string = data.error;

    console.log(
      '(onFailedToEstablishSecureConnection) Failed to establish secure connection with:',
      connectedID,
      'with error:',
      error
    );
  }

  // Runs on message successfully dispatched, does not mean it was received by the recipient.
  function onMessageSent(data: MessageSentData) {
    const messageID: string = data.messageID;

    console.log('(onMessageSent) Successfully dispatched message:', messageID);

    // Check if this is a valid connection.
    if (messageID === NULL_UUID) {
      console.log('(onMessageSent) CORRUPTED MESSAGE, Bridgefy error.', messageID);
      return;
    }

    // Sometimes Bridgefy will send messages automatically, we don't want to consider these messages.
    if (!doesMessageExist(messageID)) {
      console.log('(onMessageSent) Message sent automatically, not saving.');
      return;
    }

    // Get message from database, where it was saved as pending.
    // Update message status to success.
    const message = fetchMessage(messageID);
    setMessageWithID(messageID, {
      ...message,
      statusFlag: MessageStatus.SUCCESS,
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
  }

  // Runs on message failure to dispatch.
  function onMessageSentFailed(data: MessageSentFailedData) {
    const messageID: string = data.messageID;
    const error: string = data.error;

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
  }

  // Runs on message received.
  function onMessageReceived(data: MessageReceivedData) {
    const contactID: string = data.contactID;
    const messageID: string = data.messageID;
    const raw: string = data.raw;

    console.log('(onMessageReceived) Received message:', contactID, messageID, raw);

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
    // A text chat message is the most common type of message.
    if (isMessageText(parsedMessage)) {
      console.log('(onMessageRecieved) Received TEXT message');

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

      if (chatContact !== contactID) {
        const currentUnreadCount = conversationCache.get(contactID)?.unreadCount ?? 0;
        const newUnreadCount = currentUnreadCount + 1;

        setConversationCache(
          updateUnreadCount(
            contactID,
            getConversationHistory(contactID),
            new Map(conversationCache),
            newUnreadCount
          )
        );
        updateUnreadCountStorage(contactID, newUnreadCount);
      }
    } else if (isMessageChatInvitation(parsedMessage)) {
      // A chat invitation is sent when a user wants to start a chat with you.
      // For now we'll just accept all invitations, but in the future we'll add a UI element.
      // This logic will be substantially different in the future.
      console.log('(onMessageReceived) Received CHAT_INVITATION message');

      // Accept the invitation, inclduing the confirmation hash used to verify the invitation.
      sendChatInvitationResponseWrapper(contactID, user.nickname, parsedMessage.requestHash, true);

      // Create a new contact in the database, which correlates with a new conversation.
      // The user attaches personal information along with the invitation.
      console.log('(onMessageReceived) New contact:', contactID);
      setContactInfo(contactID, {
        contactID: contactID,
        nickname: parsedMessage.nickname,
        contactFlags: 0, // used in future versions
        verified: false, // used in future versions
        lastSeen: Date.now(),
        unreadCount: conversationCache.get(contactID)?.unreadCount ?? 0,
      });

      // Add the new contact to the list of contacts in both the database and the local state.
      setAllUsers(addContactToArray(contactID));
    } else if (isMessageChatInvitationResponse(parsedMessage)) {
      // A chat invitation response is sent when a user accepts or rejects your invitation.
      console.log('(onMessageReceived) Received CHAT_INVITATION_RESPONSE message');

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
          unreadCount: 0,
        });

        // Add the new contact to the list of contacts in both the database and the local state.
        setAllUsers(addContactToArray(contactID));
      } else {
        // If the invitation was rejected, do nothing.
        // We could add a UI element to notify the user that the invitation was rejected.
        // We also could delete the invitation from the database, but it's not super necessary.
        console.log('(onMessageReceived) Chat invitation rejected by:', contactID);
      }
    } else if (isMessageNicknameUpdate(parsedMessage)) {
      console.log('Received NICKNAME_UPDATE message');

      if (!isContact(contactID)) {
        console.log('(onMessageReceived) Received nickname update from non-contact:', contactID);
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
    } else if (isMessagePublicInfo(parsedMessage)) {
      // A connection info message is sent when another user is in your area.
      // It contains their public name, which is used to identify them before you add them.
      console.log('(onMessageReceived) Received PUBLIC_INFO message');

      // Save connection info temporarily to a cache.
      setConnectionInfo({
        contactID: contactID,
        publicName: parsedMessage.publicName,
        lastUpdated: Date.now(),
      });

      // Force the contact page to rerender.
      removeConnection('');
    } else {
      console.log('(onMessageReceived) Received unknown message type:', typeof parsedMessage);
    }
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={() => {
        const currentRouteName = navigationRef.getCurrentRoute()?.name ?? '';
        const currentProps = navigationRef.getCurrentRoute()?.params;
        if (currentRouteName === 'Chat' && isChatProps(currentProps)) {
          setChatContact(currentProps.user);
        } else {
          setChatContact('');
        }
      }}
    >
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
