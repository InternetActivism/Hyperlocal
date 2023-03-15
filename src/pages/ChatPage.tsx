import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAtom, useSetAtom } from 'jotai';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { RootStackParamList } from '../App';
import ChatHeader from '../components/features/Chat/ChatHeader';
import KeyboardView from '../components/ui/ChatKeyboardView';
import TextBubble from '../components/ui/TextBubble';
import {
  connectionInfoAtomInterface,
  conversationCacheAtom,
  getActiveConnectionsAtom,
  updateUnreadCount,
} from '../services/atoms';
import { allContactsAtom } from '../services/atoms/contacts';
import {
  addMessageToConversationAtom,
  expirePendingMessagesAtom,
} from '../services/atoms/conversation';
import { getConnectionName } from '../services/connections';
import { getContactInfo, isContact, updateUnreadCountStorage } from '../services/contacts';
import { ContactInfo, StoredDirectChatMessage } from '../services/database';
import { getDirectConversationHistory } from '../services/direct_messages';
import { setMessageWithID } from '../services/message_storage';
import { sendChatMessageWrapper } from '../services/transmission';
import { MessageStatus, MessageType, MESSAGE_PENDING_EXPIRATION_TIME } from '../utils/globals';
import { vars } from '../utils/theme';

type NavigationProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;

const ChatPage = ({ route, navigation }: NavigationProps) => {
  const { user: contactID } = route.params;
  const [conversationCache, setConversationCache] = useAtom(conversationCacheAtom);
  const [connections] = useAtom(getActiveConnectionsAtom);
  const [, setIsConnected] = useState<boolean>(false);
  const [contactInfo, setLocalContactInfo] = useState<ContactInfo | null>(null);
  const [messages, setMessages] = useState<StoredDirectChatMessage[]>([]);
  const [allContacts] = useAtom(allContactsAtom);
  const [connectionInfo] = useAtom(connectionInfoAtomInterface);
  const addMessageToConversation = useSetAtom(addMessageToConversationAtom);
  const expirePendingMessages = useSetAtom(expirePendingMessagesAtom);

  const isAcceptedRequest = contactInfo && allContacts.includes(contactID);

  /*

    Hooks

  */

  // Cause page refresh when allContacts changes.
  useEffect(() => {
    if (contactID && isContact(contactID)) {
      console.log('ChatPage refresh with', contactID);
      setLocalContactInfo(getContactInfo(contactID)); // FIX: Make this fetch from memory, not DB.
    }
  }, [allContacts, connections]); // eslint-disable-line react-hooks/exhaustive-deps

  // Runs on mount. Sets up the chat page.
  useEffect(() => {
    if (!contactID) {
      return;
    }

    // User opened chat with someone who has not accepted their chat request.
    if (!isContact(contactID)) {
      return;
    }

    // The user opened a chat with someone who has accepted their chat request.
    // Cache the contact info for the user.
    setLocalContactInfo(getContactInfo(contactID));

    // Check for pending messages that need to be expired.
    expirePendingMessages(contactID);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactID]);

  // Listen to global state of connections and update whether chat is is connected.
  useEffect(() => {
    setIsConnected(connections.includes(contactID));
  }, [connections]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll down when keyboard is shown.
  useEffect(() => {
    if (isContact(contactID)) {
      setConversationCache(
        updateUnreadCount(
          contactID,
          getDirectConversationHistory(contactID),
          new Map(conversationCache),
          0
        )
      );
      updateUnreadCountStorage(contactID, 0);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update local messages when conversation cache changes.
  useEffect(() => {
    if (!contactID) {
      return;
    }
    const conversation = conversationCache.get(contactID);
    if (conversation) {
      setMessages(conversation.history);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationCache]);

  /*

    Functions

  */

  // Runs when a user clicks on a failed message to retry sending it.
  const sendMessageAgain = async (message: StoredDirectChatMessage) => {
    console.log('(sendMessageAgain) Message to retry', message);

    // Should not happen, remove once we are confident this is not happening.
    if (message.statusFlag !== MessageStatus.FAILED) {
      console.log('(sendMessageAgain) Message is not a failed message', message);
      return;
    }

    // Hide the old message to be retried.
    // Doesn't actually delete the message from the database, just hides it.
    message.statusFlag = MessageStatus.DELETED;
    setMessageWithID(message.messageID, message);

    // Retry sending message with the same content.
    const textMessage: StoredDirectChatMessage = await sendChatMessageWrapper(
      contactID,
      message.content
    );

    addMessageToConversation(textMessage);

    // Check back in a few seconds to see if the message has failed to go through.
    // This is needed since Bridgefy doesn't always let us know if a message failed to send via messageFailedToSend.
    setTimeout(() => expirePendingMessages(contactID), MESSAGE_PENDING_EXPIRATION_TIME);
  };

  // Send message to contact. Assumes contact exists.
  const sendText = async (text: string) => {
    if (!contactID || !isContact(contactID) || !contactInfo) {
      throw new Error('Cannot send message to contact that does not exist');
    }

    // Send message via Bridgefy.
    const textMessage: StoredDirectChatMessage = await sendChatMessageWrapper(contactID, text);

    addMessageToConversation(textMessage);

    // Check back in a few seconds to see if the message has failed to go through.
    // This is needed since Bridgefy doesn't always let us know if a message failed to send via messageFailedToSend.
    setTimeout(() => expirePendingMessages(contactID), MESSAGE_PENDING_EXPIRATION_TIME);
  };

  // Render the bubbles in the chat.
  const renderBubbles = () => {
    if (!messages) {
      return;
    }

    // This uses the local messages state variable.
    // This is updated when the conversation cache changes.
    return (
      <>
        {messages.map((message: StoredDirectChatMessage) => {
          // Do not show deleted messages and nickname change messages.
          if (
            message.typeFlag === MessageType.NICKNAME_UPDATE ||
            message.statusFlag === MessageStatus.DELETED
          ) {
            return null;
          }

          // Show failed messages with a retry on click.
          if (message.statusFlag === MessageStatus.FAILED) {
            return (
              <TextBubble
                key={message.messageID}
                message={message}
                callback={() => sendMessageAgain(message)}
              />
            );
          }

          // Normal messages.
          return <TextBubble key={message.messageID} message={message} />;
        })}
      </>
    );
  };

  // Wait for contactID to be set before rendering.
  if (!contactID) {
    return <View />;
  }

  return (
    <SafeAreaView style={[styles.pageContainer]}>
      <View>
        {isAcceptedRequest ? (
          <ChatHeader
            navigation={navigation}
            contactID={contactID}
            isContact={true}
            name={contactInfo.nickname}
          />
        ) : (
          <ChatHeader
            navigation={navigation}
            contactID={contactID}
            isContact={false}
            name={getConnectionName(contactID, connectionInfo)}
          />
        )}
      </View>

      <KeyboardView
        bubbles={renderBubbles()}
        buttonState={!!(contactID && isContact(contactID) && contactInfo && isAcceptedRequest)}
        sendText={sendText}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    height: '100%',
    width: '100%',
    flex: 1,
    backgroundColor: vars.backgroundColor,
    marginBottom: -35,
  },
});

export default ChatPage;
