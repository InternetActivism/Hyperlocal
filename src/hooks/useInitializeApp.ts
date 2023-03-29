import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import {
  activeConnectionsAtom,
  addConnectionAtom,
  allContactsAtom,
  appVisibleAtom,
  bridgefyStatusAtom,
  CachedConversation,
  connectionInfoAtomInterface,
  contactInfoAtom,
  conversationCacheAtom,
  currentUserInfoAtom,
  currentViewAtom,
  notificationContentAtom,
  publicChatInfoAtom,
  removeConnectionAtom,
} from '../services/atoms';
import {
  addMessageToConversationAtom,
  setConversationUnreadCountAtom,
  updateMessageInConversationAtom,
} from '../services/atoms/conversation';
import {
  addMessageToPublicChatAtom,
  setUnreadCountPublicChatAtom,
  syncPublicChatInCacheAtom,
  updateMessageInPublicChatAtom,
} from '../services/atoms/public_chat';
import {
  getConnectedPeers,
  getUserId,
  linkListenersToEvents,
  startSDK,
} from '../services/bridgefy-link';
import { verifyChatInvitation } from '../services/chat_invitations';
import { getConnectionName } from '../services/connections';
import {
  ContactInfo,
  StoredDirectChatMessage,
  StoredPublicChatMessage,
} from '../services/database';
import { doesMessageExist, fetchConversation, fetchMessage } from '../services/message_storage';
import {
  Message,
  sendChatInvitationResponseWrapper,
  sendConnectionInfoWrapper,
  sendNicknameUpdateWrapper,
} from '../services/transmission';
import { logEvent } from '../utils/analytics';
import {
  isMessageChatInvitation,
  isMessageChatInvitationResponse,
  isMessageNicknameUpdate,
  isMessagePublicChatMessage,
  isMessagePublicInfo,
  isMessageText,
} from '../utils/getMessageType';
import {
  BridgefyErrors,
  BridgefyErrorStates,
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
  SEND_NICKNAME_TO_NON_CONTACTS,
  StartData,
  StopData,
  StoredMessageType,
} from '../utils/globals';

// Required because Bridgefy will sometimes connect with the wrong UUID
// so the user will not receive the nickname when it is initially sent.
const ALWAYS_SEND_NICKNAME = true;

export default function useInitializeApp() {
  // Information about the app user which is both stored in the database and loaded into memory.
  const [currentUserInfo, setCurrentUserInfo] = useAtom(currentUserInfoAtom);

  // Connection info is a map of connection IDs to connection info (name, last seen, etc.) that is temporarily stored in memory.
  const [connectionInfo, setConnectionInfo] = useAtom(connectionInfoAtomInterface);

  // Connections is a list of all active connections that is temporarily stored in memory.
  const [connections, setConnections] = useAtom(activeConnectionsAtom);
  const [, addConnection] = useAtom(addConnectionAtom); // Atomic operation to add a connection to the list of active connections.
  const [, removeConnection] = useAtom(removeConnectionAtom); // Atomic operation to remove a connection from the list of active connections.

  // Conversation cache is a map of contact IDs to conversation histories that is temporarily stored in memory.
  const [conversationCache, setConversationCache] = useAtom(conversationCacheAtom);

  const syncPublicChatInCache = useSetAtom(syncPublicChatInCacheAtom);

  // Bridgefy status is a string that is used to determine the current state of the Bridgefy SDK.
  const [bridgefyStatus, setBridgefyStatus] = useAtom(bridgefyStatusAtom);

  // The current contact the user is chatting with.
  const currentView = useAtomValue(currentViewAtom);

  // Bridgefy events.
  const [event, setEvent] = useState<EventPacket | null>(null);

  const contacts = useAtomValue(allContactsAtom);

  const [allContactsInfo, setAllContactsInfo] = useAtom(contactInfoAtom);

  const [publicChatInfo] = useAtom(publicChatInfoAtom);

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useAtom(appVisibleAtom);

  const setNotificationContent = useSetAtom(notificationContentAtom);

  const addMessageToConversation = useSetAtom(addMessageToConversationAtom);
  const updateMessageInConversation = useSetAtom(updateMessageInConversationAtom);
  const addMessageToPublicChat = useSetAtom(addMessageToPublicChatAtom);
  const updateMessageInPublicChat = useSetAtom(updateMessageInPublicChatAtom);
  const setConversationUnreadCount = useSetAtom(setConversationUnreadCountAtom);
  const setUnreadCountPublicChat = useSetAtom(setUnreadCountPublicChatAtom);

  /*

    HELPER FUNCTIONS

    Some helpful functions that are used in the event listeners.

  */
  const handleEvent = (packet: EventPacket) => {
    setEvent(packet);
  };

  const handleBridgefyError = (error: number) => {
    switch (error) {
      case BridgefyErrors.LICENSE_ERROR:
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
        const newUser = {
          userID: '698E84AE-67EE-4057-87FF-788F88069B68',
          nickname: 'test-user',
          userFlags: 0,
          privacy: 0, // used in future versions
          verified: false, // used in future versions
          dateCreated: Date.now(),
          dateUpdated: Date.now(),
          isOnboarded: false,
          isInitialized: false,
        };
        setCurrentUserInfo(newUser);
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

  const initializeUserBridgefy = (userID: string) => {
    console.log('(initializeUserBridgefy) Starting with user ID:', userID);

    setCurrentUserInfo({
      ...currentUserInfo,
      userID,
      isInitialized: true, // set initialized to true, isOnboarded is set after Bluetooth grant.
    });
    setBridgefyStatus(BridgefyStates.ONLINE);
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

  const createConversationCache = () => {
    if (!contacts) {
      return;
    }
    const updatedConversationCache: Map<string, CachedConversation> = new Map(conversationCache);

    for (const contactID of contacts) {
      const contactInfo: ContactInfo | undefined = allContactsInfo[contactID];
      if (!contactInfo) {
        throw new Error('(createConversationCache) Contact info not found');
      }

      const unreadCount: number = contactInfo.unreadCount ?? 0;
      const history: StoredDirectChatMessage[] =
        !contactInfo.lastMsgPointer || !contactInfo.firstMsgPointer
          ? []
          : (fetchConversation(contactInfo.lastMsgPointer) as StoredDirectChatMessage[]);

      const conversation: CachedConversation = {
        contactID,
        history,
        lastUpdated: Date.now(),
        unreadCount,
      };
      updatedConversationCache.set(contactID, conversation);
    }

    setConversationCache(updatedConversationCache);
  };

  const checkUpToDateName = (contactID: string) => {
    console.log('(checkUpToDateName) Checking:', contactID);

    // Send nickname update to non contacts every time! Privacy risk, remove later.
    if (!contacts.includes(contactID)) {
      console.log(
        '(checkUpToDateName) Sending nickname update to non contact:',
        contactID,
        ', nickname:',
        currentUserInfo.nickname
      );
      // send a nickname update message
      if (SEND_NICKNAME_TO_NON_CONTACTS && currentUserInfo?.userID) {
        sendConnectionInfoWrapper(currentUserInfo.userID, contactID, currentUserInfo.nickname);
      }
      return;
    }

    const contactInfo: ContactInfo | undefined = allContactsInfo[contactID];
    if (!contactInfo) {
      throw new Error('(checkUpToDateName) Contact info not found');
    }

    // Check if user's contact info is up to date, send update if not.
    // Last seen is the last time we connected to the contact.
    // TODO: dateUpdated could be from something else than a nickname update.
    if (contactInfo.lastSeen < currentUserInfo.dateUpdated || ALWAYS_SEND_NICKNAME) {
      // This fixes the issue with the nickname not updating, temporary.
      console.log('(checkUpToDateName) Sending nickname update:', contactID);
      // send a nickname update message
      sendNicknameUpdateWrapper(contactInfo, currentUserInfo.nickname);
    }
  };

  // add listeners on init
  useEffect(() => {
    console.log('(initialization) Creating listeners...');

    linkListenersToEvents(handleEvent);

    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      setAppStateVisible(nextAppState);
      appState.current = nextAppState;
    });

    return () => {
      appStateSubscription.remove();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    async function updateConnectedPeers() {
      const connectedPeers = await getConnectedPeers();
      console.log('(App) Connected peers:', connectedPeers);
      setConnections(connectedPeers);
    }

    // Only run if Bridgefy is online
    if (
      !BridgefyErrorStates.includes(bridgefyStatus) &&
      bridgefyStatus !== BridgefyStates.OFFLINE
    ) {
      updateConnectedPeers();
    }
  }, [appStateVisible, setConnections, bridgefyStatus]);

  // start bridgefy sdk once onboarded
  useEffect(() => {
    if (!currentUserInfo.isOnboarded) {
      return;
    }
    setBridgefyStatus(BridgefyStates.STARTING);
    startSDK()
      .then(() => {
        getUserId()
          .then((userID: string) => {
            initializeUserBridgefy(userID);
          })
          .catch((error: number) => {
            handleBridgefyError(error);
          });
      })
      .catch((error: number) => {
        handleBridgefyError(error);
      });
    createConversationCache();
    syncPublicChatInCache();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserInfo?.isOnboarded]);

  // Checks if all connections have user's updated nickname.
  useEffect(() => {
    console.log('(App) User info update:', currentUserInfo);
    if (currentUserInfo?.userID) {
      for (const connection of connections) {
        checkUpToDateName(connection);
      }
    }
    //TODO (krishkrosh): figure out why adding connections to the dependency array causes an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserInfo]);

  // Handles all events from the Bridgefy link.
  useEffect(() => {
    if (!event) {
      return;
    }
    const listenerFunction: (data: EventData) => void = eventListeners[event.type];
    listenerFunction(event.data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  /*

    EVENT LISTENERS

    None of these can access atoms directly for some reason, but they can used as setters? Maybe? What the fuck who knows.
    Lots of testing needed, Jotai seems to be a bit buggy.
    Basically, do not trust any atoms in the listener functions. Trust the database instead.
    We need to do some race condition testing in the future here.

  */

  // Runs on Bridgefy SDK start.
  async function onStart(_data: StartData) {
    console.log('(onStart) Started Bridgefy');
    await logEvent('onStart', { userID: currentUserInfo.userID });
    setBridgefyStatus(BridgefyStates.ONLINE);
  }

  // Runs on Bridgefy SDK start failure.
  async function onFailedToStart(data: FailedToStartData) {
    const error: string = data.error;

    console.log('(onFailedToStart) Failed to start:', error);
    await logEvent('onFailedToStart', { userID: currentUserInfo.userID, error });

    const errorCode: number = parseInt(error, 10);
    handleBridgefyError(errorCode);
  }

  // Runs on Bridgefy SDK stop.
  async function onStop(_data: StopData) {
    console.log('(onStop) Stopped');
    await logEvent('onStop', { userID: currentUserInfo.userID });
    setBridgefyStatus(BridgefyStates.OFFLINE);
  }

  // Runs on Bridgefy SDK stop failure.
  async function onFailedToStop(data: FailedToStopData) {
    const error: string = data.error;

    console.log('(onFailedToStop) Failed to stop:', error);
    await logEvent('onFailedToStop', { userID: currentUserInfo.userID, error });
    setBridgefyStatus(BridgefyStates.FAILED);
  }

  // Runs on connection to another user.
  // Remember that we connect with many people who are not in our contacts and we will not speak to.
  // We currently send "ConnectionInfo" to all connections to share our nickname.
  async function onConnect(data: ConnectData) {
    const connectedID: string = data.userID;

    console.log('(onConnect) Connected:', connectedID);
    await logEvent('onConnect', { userID: currentUserInfo.userID, connectedID });

    // Check if this is a valid connection.
    if (connectedID === NULL_UUID) {
      console.error('(onConnect) CORRUPTED CONNECTION', connectedID);
      return;
    }

    // Add connection to our list of active connections.
    addConnection(connectedID);

    // Check if this connection has our updated nickname.
    // We should be able to get this from Jotai, but it's not working for some reason.
    // This is probably related to the scope of this function and it being called via the listener.
    // For now we will just get it from the database.

    checkUpToDateName(connectedID);

    // We already update the last seen on disconnect, but sometimes clients don't disconnect properly.
    if (contacts.includes(connectedID)) {
      console.log('(onConnect) Updating last seen for contact:', allContactsInfo[connectedID]);
      setAllContactsInfo((prev) => {
        prev[connectedID] = { ...prev[connectedID], lastSeen: Date.now() };
        return { ...prev };
      });
    }
  }

  async function onDisconnect(data: DisconnectData) {
    const connectedID: string = data.userID;

    console.log('(onDisconnect) Disconnected:', connectedID);
    await logEvent('onDisconnect', { userID: currentUserInfo.userID, connectedID });

    // Check if this is a valid connection.
    if (connectedID === NULL_UUID) {
      console.log('(onDisconnect) CORRUPTED CONNECTION, Bridgefy error.', connectedID);
      return;
    }

    // Remove connection from our list of active connections.
    removeConnection(connectedID);

    if (contacts.includes(connectedID)) {
      // updateLastSeen(connectedID);
      setAllContactsInfo((prev) => {
        prev[connectedID] = { ...prev[connectedID], lastSeen: Date.now() };
        return { ...prev };
      });
    }
  }

  // Runs when a secure connection with a user is established
  async function onEstablishedSecureConnection(data: EstablishedSecureConnectionData) {
    const connectedID: string = data.userID;
    console.log('(onEstablishedSecureConnection) Secure connection established with:', connectedID);
    await logEvent('onEstablishedSecureConnection', {
      userID: currentUserInfo.userID,
      connectedID,
    });
  }

  // Runs when a secure connection cannot be made
  async function onFailedToEstablishSecureConnection(data: FailedToEstablishSecureConnectionData) {
    const connectedID: string = data.userID;
    const error: string = data.error;

    console.log(
      '(onFailedToEstablishSecureConnection) Failed to establish secure connection with:',
      connectedID,
      'with error:',
      error
    );
    await logEvent('onFailedToEstablishSecureConnection', {
      userID: currentUserInfo.userID,
      connectedID,
      error,
    });
  }

  // Runs on message successfully dispatched, does not mean it was received by the recipient.
  async function onMessageSent(data: MessageSentData) {
    const messageID: string = data.messageID;

    console.log('(onMessageSent) Successfully dispatched message:', messageID);
    await logEvent('onMessageSent', { userID: currentUserInfo.userID, messageID });

    // Check if this is a valid connection.
    if (messageID === NULL_UUID) {
      console.error('(onMessageSent) CORRUPTED MESSAGE, Bridgefy error.', messageID);
      return;
    }

    if (!doesMessageExist(messageID)) {
      // Sometimes Bridgefy will send messages automatically, we don't want to consider these messages.
      console.log('(onMessageSent) Message sent automatically, not saving.');
      return;
    }

    // Get message from database, where it was saved as pending.

    const message = fetchMessage(messageID);

    // Check if this is a direct message to a contact in our database.
    if (message.type === StoredMessageType.STORED_DIRECT_MESSAGE) {
      // Update message status to success.
      updateMessageInConversation({
        messageID: messageID,
        message: {
          ...message,
          statusFlag: MessageStatus.SUCCESS,
        },
      });
    } else if (message.type === StoredMessageType.STORED_PUBLIC_MESSAGE) {
      // Update message status to success.
      updateMessageInPublicChat({
        messageID: messageID,
        message: {
          ...message,
          statusFlag: MessageStatus.SUCCESS,
        },
      });
    }
  }

  // Runs on message failure to dispatch.
  async function onMessageSentFailed(data: MessageSentFailedData) {
    const messageID: string = data.messageID;
    const error: string = data.error;

    console.log('(onMessageSentFailed) Message failed to send, error:', error);
    await logEvent('onMessageSentFailed', { userID: currentUserInfo.userID, messageID, error });

    // Check if this is a valid connection.
    if (messageID === NULL_UUID) {
      console.error(
        '(onMessageSentFailed) CORRUPTED MESSAGE, Bridgefy error.',
        messageID,
        ` message exists: ${doesMessageExist(messageID)}`
      );
      return;
    }

    if (!doesMessageExist(messageID)) {
      // Sometimes Bridgefy will send messages automatically, we don't want to consider these messages.
      console.log('(onMessageSentFailed) Message sent automatically, not saving.');
      return;
    }

    // Get message from database, where it was saved as pending.
    const message = fetchMessage(messageID);

    // Check if this is a direct message to a contact in our database.
    if (message.type === StoredMessageType.STORED_DIRECT_MESSAGE) {
      // Update message status to success, save to database and update in-memory cache.
      updateMessageInConversation({
        messageID: messageID,
        message: {
          ...message,
          statusFlag: MessageStatus.FAILED,
        },
      });
    } else if (message.type === StoredMessageType.STORED_PUBLIC_MESSAGE) {
      // Update message status to success.
      updateMessageInPublicChat({
        messageID: messageID,
        message: {
          ...message,
          statusFlag: MessageStatus.FAILED,
        },
      });
    } else {
      // Sometimes Bridgefy will send messages automatically, we don't want to consider these messages.
      console.log('(onMessageSent) Message sent automatically, not saving.');
      return;
    }
  }

  // Runs on message received.
  async function onMessageReceived(data: MessageReceivedData) {
    const contactID: string = data.contactID;
    const messageID: string = data.messageID;
    const raw: string = data.raw;
    const transmission: string = data.transmission;

    // console.log('(onMessageReceived) Received message:', contactID, messageID, raw, transmission);
    console.log(`\n(onMessageReceived) Received message from ${contactID} with id ${messageID}`);
    console.log(`(onMessageReceived) Raw message: ${raw} and transmission: ${transmission}`);
    await logEvent('onMessageReceived', {
      userID: currentUserInfo.userID,
      contactID,
      messageID,
      transmission,
    });

    // Sometimes we'll receive corrupted messages, so we don't want to crash the app.
    if (
      messageID === NULL_UUID ||
      contactID === NULL_UUID ||
      !contactID ||
      !messageID ||
      !raw ||
      !transmission
    ) {
      console.error('(onMessageReceived) CORRUPTED MESSAGE', contactID, messageID, raw);
      return;
    }

    // Check that we have initialized the user.
    if (!currentUserInfo.userID) {
      throw new Error('(onMessageReceived) No personal user info, app still starting.');
    }

    // A parsed message is polymorphic, it can be any of the message types.
    // See possible types in the transmission.ts file.
    // Sometimes we'll receive corrupted messages, so we don't want to crash the app.
    let parsedMessage: Message;
    try {
      parsedMessage = JSON.parse(raw);
    } catch (e) {
      console.log(raw);
      console.error('(onMessageReceived) Not JSON, corrupted message. Bridgefy error or attack.');
      return;
    }

    // If the userID we received from is not connected to us, this might be the false connection bug. Console log it.
    if (!connections.includes(contactID)) {
      console.error('(onMessageReceived) Received message from non-connected user:', contactID);
    }

    // Depending on the type of message, we will handle it differently.
    // A text chat message is the most common type of message.
    if (isMessageText(parsedMessage)) {
      console.log('(onMessageReceived) Received TEXT message');

      // We should only receive messages from contacts that we have started a chat with.
      // Ignore people trying to send us a message if we haven't added them.
      if (!contacts.includes(contactID)) {
        console.log('(onMessageReceived) Received message from non-contact:', contactID);
        return;
      }

      // Since we know that the contact is valid, we can get their info.
      // This is not needed for the message to be saved, but it's useful for debugging.
      const contactInfo = allContactsInfo[contactID];
      console.log('(onMessageReceived) New message from', contactInfo.nickname);

      const message: StoredDirectChatMessage = {
        type: StoredMessageType.STORED_DIRECT_MESSAGE,
        messageID,
        contactID,
        isReceiver: true,
        typeFlag: parsedMessage.flags,
        statusFlag: MessageStatus.SUCCESS, // received successfully
        content: parsedMessage.message,
        createdAt: parsedMessage.createdAt, // unix timestamp
        receivedAt: Date.now(), // unix timestamp
      };

      addMessageToConversation(message);

      if (currentView !== contactID) {
        setConversationUnreadCount({
          contactID: contactInfo.contactID,
          unreadCount: contactInfo.unreadCount + 1,
        });

        setNotificationContent({
          contactID: contactInfo.contactID,
          name: contactInfo.nickname,
          message: parsedMessage.message,
          messageID: messageID,
          isPublic: false,
        });
      }
    } else if (isMessagePublicChatMessage(parsedMessage)) {
      console.log('(onMessageReceived) Received PUBLIC_CHAT_MESSAGE message');

      // Since we know that the contact is valid, we can get their info.
      // getContactInfo is an unsafe operation, it'll fail if the contact doesn't exist.
      // This is not needed for the message to be saved, but it's useful for debugging.
      console.log('(onMessageReceived) New public chat message from', parsedMessage.nickname);

      // Save the message to the database.
      const message: StoredPublicChatMessage = {
        type: StoredMessageType.STORED_PUBLIC_MESSAGE,
        messageID,
        senderID: contactID,
        nickname: parsedMessage.nickname,
        isReceiver: true,
        statusFlag: MessageStatus.SUCCESS, // received successfully
        content: parsedMessage.message,
        createdAt: parsedMessage.createdAt, // unix timestamp
        receivedAt: Date.now(), // unix timestamp
      };

      addMessageToPublicChat(message);

      if (currentView !== 'PUBLIC_CHAT') {
        setUnreadCountPublicChat(publicChatInfo.unreadCount + 1);
        setNotificationContent({
          contactID: contactID,
          name: parsedMessage.nickname,
          message: parsedMessage.message,
          messageID: messageID,
          isPublic: true,
        });
      }
    } else if (isMessageChatInvitation(parsedMessage)) {
      // A chat invitation is sent when a user wants to start a chat with you.
      // For now we'll just accept all invitations, but in the future we'll add a UI element.
      // This logic will be substantially different in the future.
      console.log('(onMessageReceived) Received CHAT_INVITATION message');

      // Accept the invitation, including the confirmation hash used to verify the invitation.
      sendChatInvitationResponseWrapper(
        contactID,
        currentUserInfo.nickname,
        parsedMessage.requestHash,
        true
      );

      // Create a new contact in the database, which correlates with a new conversation.
      // The user attaches personal information along with the invitation.
      console.log('(onMessageReceived) New contact:', contactID);

      const oldContactInfo = allContactsInfo;
      oldContactInfo[contactID] = {
        contactID: contactID,
        nickname: parsedMessage.nickname,
        contactFlags: 0, // used in future versions
        verified: false, // used in future versions
        lastSeen: Date.now(),
        unreadCount: conversationCache.get(contactID)?.unreadCount ?? 0,
      };
      setAllContactsInfo({ ...oldContactInfo });
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

        setAllContactsInfo((prev) => {
          prev[contactID] = {
            contactID: contactID,
            nickname: getConnectionName(contactID, connectionInfo),
            contactFlags: 0, // used in future versions
            verified: false, // used in future versions
            lastSeen: Date.now(),
            unreadCount: 0,
          };
          return { ...prev };
        });
      } else {
        // If the invitation was rejected, do nothing.
        // We could add a UI element to notify the user that the invitation was rejected.
        // We also could delete the invitation from the database, but it's not super necessary.
        console.log('(onMessageReceived) Chat invitation rejected by:', contactID);
      }
    } else if (isMessageNicknameUpdate(parsedMessage)) {
      console.log('Received NICKNAME_UPDATE message');

      if (!contacts.includes(contactID)) {
        console.log('(onMessageReceived) Received nickname update from non-contact:', contactID);
        return;
      }

      const contactInfo = allContactsInfo[contactID];

      console.log('(onMessageReceived) Nickname change for', contactInfo.contactID);

      const oldContactInfo = allContactsInfo;
      oldContactInfo[contactID] = {
        ...contactInfo,
        nickname: parsedMessage.nickname,
      };
      setAllContactsInfo({ ...oldContactInfo });

      const message: StoredDirectChatMessage = {
        type: StoredMessageType.STORED_DIRECT_MESSAGE,
        messageID,
        contactID,
        isReceiver: true,
        typeFlag: parsedMessage.flags,
        statusFlag: MessageStatus.SUCCESS, // received successfully
        content: parsedMessage.nickname,
        createdAt: parsedMessage.createdAt, // unix timestamp
        receivedAt: Date.now(), // unix timestamp
      };

      addMessageToConversation(message);
    } else if (isMessagePublicInfo(parsedMessage)) {
      // A connection info message is sent when another user is in your area.
      // It contains their public name, which is used to identify them before you add them.
      console.log('(onMessageReceived) Received PUBLIC_INFO message');

      // Check if the ID of the sender matches the ID attached to the message.
      // If it's wrong, Bridgefy has falsely identified the sender.
      // If it's undefined, it's from an old version of the app.
      if (parsedMessage.senderID !== undefined && contactID !== parsedMessage.senderID) {
        console.error(
          '(onMessageReceived) Received PUBLIC_INFO message from incorrect sender:',
          contactID,
          parsedMessage.senderID
        );
      }

      // Save connection info temporarily to a cache.
      setConnectionInfo({
        contactID: contactID,
        publicName: parsedMessage.publicName,
        lastUpdated: Date.now(),
      });
    } else {
      console.log('(onMessageReceived) Received unknown message type:', typeof parsedMessage);
    }
  }
}
