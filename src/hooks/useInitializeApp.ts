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
  SecureStatus,
} from '../services/atoms';
import {
  addMessageToConversationAtom,
  setConversationUnreadCountAtom,
  updateMessageInConversationAtom,
  updateMessageStatusAtom,
} from '../services/atoms/conversation';
import {
  addMessageToPublicChatAtom,
  setUnreadCountPublicChatAtom,
  syncPublicChatInCacheAtom,
  updateMessageInPublicChatAtom,
} from '../services/atoms/public_chat';
import {
  eventEmitter,
  getConnectedPeers,
  getUserId,
  linkListenersToEvents,
  startSDK,
  supportedEvents,
} from '../services/bridgefy-link';
import { verifyChatInvitation } from '../services/chat_invitations';
import { getConnectionName } from '../services/connections';
import {
  ContactInfo,
  getLast10ReceivedMessageIDs,
  StoredDirectChatMessage,
  StoredPublicChatMessage,
} from '../services/database';
import { doesMessageExist, fetchConversation, fetchMessage } from '../services/message_storage';
import {
  Message,
  sendChatInvitationResponseWrapper,
  sendChatInvitationWrapper,
  sendConnectionInfoWrapper,
  sendNicknameUpdateWrapper,
} from '../services/transmission';
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
  BridgefyState,
  BridgefyStatus,
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
  TransmissionMode,
  TransmissionModeType,
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
  const updateMessageStatus = useSetAtom(updateMessageStatusAtom);

  /*

    HELPER FUNCTIONS

    Some helpful functions that are used in the event listeners.

  */
  const handleEvent = (packet: EventPacket) => {
    setEvent(packet);
  };

  const handleBridgefyError = (error: BridgefyState) => {
    console.log('(handleBridgefyError) Bridgefy error occurred: ', error);

    setBridgefyStatus(error);

    if (error === BridgefyErrors.SIMULATOR_NOT_SUPPORTED) {
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
    }
  };

  const initializeUserBridgefy = (userID: string) => {
    console.log('(initializeUserBridgefy) Starting with user ID:', userID);

    setCurrentUserInfo({
      ...currentUserInfo,
      userID,
      isInitialized: true, // set initialized to true, isOnboarded is set after Bluetooth grant.
    });
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
    [EventType.SESSION_DESTROYED]: onSessionDestroyed,
    [EventType.FAILED_TO_DESTROY_SESSION]: onFailedToDestroySession,
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
      if (nextAppState === 'active' || nextAppState === 'background') {
        setAppStateVisible(nextAppState);
        appState.current = nextAppState;
      }
    });

    return () => {
      appStateSubscription.remove();
      console.log('(initialization) Removing listeners...');
      eventEmitter.removeAllListeners(supportedEvents.onDidConnect);
      eventEmitter.removeAllListeners(supportedEvents.onDidDisconnect);
      eventEmitter.removeAllListeners(supportedEvents.onDidFailToStop);
      eventEmitter.removeAllListeners(supportedEvents.onDidReceiveMessage);
      eventEmitter.removeAllListeners(supportedEvents.onDidStart);
      eventEmitter.removeAllListeners(supportedEvents.onDidStop);
      eventEmitter.removeAllListeners(supportedEvents.onEstablishedSecureConnection);
      eventEmitter.removeAllListeners(supportedEvents.onFailedToEstablishSecureConnection);
      eventEmitter.removeAllListeners(supportedEvents.onFailedToStart);
      eventEmitter.removeAllListeners(supportedEvents.onMessageSent);
      eventEmitter.removeAllListeners(supportedEvents.onMessageSentFailed);
    };
  }, [setAppStateVisible]);

  useEffect(() => {
    async function updateConnectedPeers() {
      const connectedPeers = await getConnectedPeers();
      console.log('(App) Connected peers:', connectedPeers);
      setConnections(connectedPeers);
    }

    // Only run if Bridgefy is online
    if (bridgefyStatus === BridgefyStatus.ONLINE) {
      updateConnectedPeers();
    }
  }, [appStateVisible, setConnections, bridgefyStatus]);

  // start bridgefy sdk once onboarded
  useEffect(() => {
    if (!currentUserInfo.isOnboarded) {
      return;
    }
    setBridgefyStatus(BridgefyStatus.STARTING);
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
  }, [currentUserInfo.nickname]);

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
  function onStart(_data: StartData) {
    console.log('(onStart) Started Bridgefy');
    setBridgefyStatus(BridgefyStatus.ONLINE);
  }

  // Runs on Bridgefy SDK start failure.
  function onFailedToStart(data: FailedToStartData) {
    const error: number = data.error;

    console.log('(onFailedToStart) Failed to start:', error);

    handleBridgefyError(error);
  }

  // Runs on Bridgefy SDK stop.
  function onStop(_data: StopData) {
    console.log('(onStop) Stopped');
    setBridgefyStatus(BridgefyStatus.OFFLINE);
  }

  // Runs on Bridgefy SDK stop failure.
  function onFailedToStop(data: FailedToStopData) {
    const error: number = data.error;

    console.log('(onFailedToStop) Failed to stop:', error);
    setBridgefyStatus(BridgefyStatus.FAILED);
  }

  // Runs on connection to another user.
  // Remember that we connect with many people who are not in our contacts and we will not speak to.
  // We currently send "ConnectionInfo" to all connections to share our nickname.
  function onConnect(data: ConnectData) {
    const connectedID: string = data.userID;

    console.log('(onConnect) Connected:', connectedID);

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

    if (contacts.includes(connectedID)) {
      // updateLastSeen(connectedID);
      setAllContactsInfo((prev) => {
        prev[connectedID] = { ...prev[connectedID], lastSeen: Date.now() };
        return { ...prev };
      });
    }
  }

  // Runs when a secure connection with a user is established
  function onEstablishedSecureConnection(data: EstablishedSecureConnectionData) {
    const connectedID: string = data.userID;
    console.log('(onEstablishedSecureConnection) Secure connection established with:', connectedID);

    const oldConnectionInfo = connectionInfo.get(connectedID);
    if (!oldConnectionInfo) {
      return;
    }

    setConnectionInfo({
      ...oldConnectionInfo,
      secureStatus: SecureStatus.SECURE,
    });

    // Send chat invitation message via Bridgefy.
    sendChatInvitationWrapper(connectedID, currentUserInfo.nickname);
  }

  // Runs when a secure connection cannot be made
  function onFailedToEstablishSecureConnection(data: FailedToEstablishSecureConnectionData) {
    const connectedID: string = data.userID;
    const error: number = data.error;

    console.log(
      '(onFailedToEstablishSecureConnection) Failed to establish secure connection with:',
      connectedID,
      'with error:',
      error
    );

    if (error === BridgefyErrors.CONNECTION_IS_ALREADY_SECURE) {
      sendChatInvitationWrapper(connectedID, currentUserInfo.nickname);
    } else {
      const oldConnectionInfo = connectionInfo.get(connectedID);
      if (!oldConnectionInfo) {
        return;
      }

      setConnectionInfo({
        ...oldConnectionInfo,
        secureStatus: SecureStatus.FAILED,
      });
    }
  }

  // Runs on message successfully dispatched, does not mean it was received by the recipient.
  function onMessageSent(data: MessageSentData) {
    const messageID: string = data.messageID;

    console.log('(onMessageSent) Dispatched message:', messageID);

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
          statusFlag:
            message.transmissionMode === TransmissionMode.P2P
              ? MessageStatus.DELIVERED
              : MessageStatus.SENT,
        },
      });
    } else if (message.type === StoredMessageType.STORED_PUBLIC_MESSAGE) {
      // Update message status to success.
      updateMessageInPublicChat({
        messageID: messageID,
        message: {
          ...message,
          statusFlag: MessageStatus.SENT,
        },
      });
    }
  }

  // Runs on message failure to dispatch.
  function onMessageSentFailed(data: MessageSentFailedData) {
    const messageID: string = data.messageID;
    const error: number = data.error;

    console.log('(onMessageSentFailed) Message failed to send, error:', error);

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
  function onMessageReceived(data: MessageReceivedData) {
    const contactID: string = data.contactID;
    const messageID: string = data.messageID;
    const raw: string = data.raw;
    const transmission: TransmissionModeType = data.transmission;

    console.log(`\n(onMessageReceived) Received message from ${contactID} with id ${messageID}`);
    console.log(`(onMessageReceived) Raw message: ${raw} and transmission: ${transmission}`);

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
      console.warn('(onMessageReceived) Received message from non-connected user:', contactID);
    }

    // Depending on the type of message, we will handle it differently.
    // A text chat message is the most common type of message.
    if (isMessageText(parsedMessage)) {
      console.log('(onMessageReceived) Received TEXT message');
      updateMessageStatus({
        contactID: contactID,
        receivedMessageIDs: parsedMessage.receivedMessageIDs,
      });
      // We should only receive messages from contacts that we have started a chat with.
      // Ignore people trying to send us a message if we haven't added them.
      if (!contacts.includes(contactID) && transmission === TransmissionMode.P2P) {
        console.log('(onMessageReceived) Received message from non-contact:', contactID);
        return;
      }

      // Check if we already have this message
      const contactInfo = allContactsInfo[contactID];
      const lastReceivedMessages = getLast10ReceivedMessageIDs(contactInfo.lastMsgPointer);
      const lastReceivedMessageIDs = lastReceivedMessages.map((message) => message.messageID);

      if (
        lastReceivedMessageIDs &&
        lastReceivedMessageIDs.includes(parsedMessage.messageID ?? messageID)
      ) {
        console.warn('(onMessageReceived) Received duplicate message, ignoring');
        return;
      }

      // Since we know that the contact is valid, we can get their info.
      // This is not needed for the message to be saved, but it's useful for debugging.
      console.log('(onMessageReceived) New message from', contactInfo.nickname);

      const message: StoredDirectChatMessage = {
        type: StoredMessageType.STORED_DIRECT_MESSAGE,
        messageID: parsedMessage.messageID ?? messageID,
        contactID,
        isReceiver: true,
        typeFlag: parsedMessage.flags,
        statusFlag: MessageStatus.DELIVERED, // delivered successfully
        content: parsedMessage.message,
        createdAt: parsedMessage.createdAt, // unix timestamp
        receivedAt: Date.now(), // unix timestamp
        transmissionMode: transmission,
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
          messageID: parsedMessage.messageID ?? messageID,
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
        statusFlag: MessageStatus.DELIVERED, // delivered successfully
        content: parsedMessage.message,
        createdAt: parsedMessage.createdAt, // unix timestamp
        receivedAt: Date.now(), // unix timestamp
        transmissionMode: TransmissionMode.BROADCAST,
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
        ...oldContactInfo[contactID],
        contactID: contactID,
        nickname: parsedMessage.nickname,
        contactFlags: 0, // used in future versions
        verified: false, // used in future versions
        lastSeen: Date.now(),
        dateCreated: Date.now(),
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
            ...prev[contactID],
            contactID: contactID,
            nickname: getConnectionName(contactID, connectionInfo),
            contactFlags: 0, // used in future versions
            verified: false, // used in future versions
            lastSeen: Date.now(),
            dateCreated: Date.now(),
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
        statusFlag: MessageStatus.DELIVERED, // delivered successfully
        content: parsedMessage.nickname,
        createdAt: parsedMessage.createdAt, // unix timestamp
        receivedAt: Date.now(), // unix timestamp
        transmissionMode: transmission,
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

      const currentConnectionInfo = connectionInfo.get(contactID);

      // Save connection info temporarily to a cache.
      setConnectionInfo({
        contactID: contactID,
        publicName: parsedMessage.publicName,
        lastUpdated: Date.now(),
        secureStatus: currentConnectionInfo?.secureStatus ?? SecureStatus.NOT_SECURE,
      });
    } else {
      console.log('(onMessageReceived) Received unknown message type:', typeof parsedMessage);
    }
  }

  async function onSessionDestroyed() {
    console.log('(onDidDestroySession) Session destroyed');
    setBridgefyStatus(BridgefyStatus.DESTROYED);
  }

  async function onFailedToDestroySession() {
    console.log('(onDidFailToDestroySession) Failed to destroy session');
    setBridgefyStatus(BridgefyStatus.FAILED_TO_DESTROY);
  }
}
