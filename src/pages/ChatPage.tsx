import { StackScreenProps } from '@react-navigation/stack';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../App';
import ChatHeader from '../components/features/Chat/ChatHeader';
import KeyboardView from '../components/ui/ChatKeyboardView';
import TextBubble from '../components/ui/TextBubble';
import {
  activeConnectionsAtom,
  allContactsAtom,
  contactInfoAtom,
  conversationCacheAtom,
} from '../services/atoms';
import {
  addMessageToConversationAtom,
  expirePendingMessagesAtom,
  setConversationUnreadCountAtom,
  updateMessageInConversationAtom,
} from '../services/atoms/conversation';
import { StoredDirectChatMessage } from '../services/database';
import { sendChatMessageWrapper } from '../services/transmission';
import { MessageStatus, MessageType, MESSAGE_PENDING_EXPIRATION_TIME } from '../utils/globals';
import { vars } from '../utils/theme';

type NavigationProps = StackScreenProps<RootStackParamList, 'Chat'>;

const ChatPage = ({ route, navigation }: NavigationProps) => {
  const { user: contactID } = route.params;
  const conversationCache = useAtomValue(conversationCacheAtom);
  const [connections] = useAtom(activeConnectionsAtom);
  const [messages, setMessages] = useState<StoredDirectChatMessage[]>([]);
  const [allContacts] = useAtom(allContactsAtom);
  const allContactsInfo = useAtomValue(contactInfoAtom);
  const addMessageToConversation = useSetAtom(addMessageToConversationAtom);
  const updateMessageInConversation = useSetAtom(updateMessageInConversationAtom);
  const expirePendingMessages = useSetAtom(expirePendingMessagesAtom);
  const setConversationUnreadCount = useSetAtom(setConversationUnreadCountAtom);

  /*

    Hooks

  */

  // Runs on mount. Sets up the chat page.
  useEffect(() => {
    if (!contactID) {
      return;
    }

    // User opened chat with someone who has not accepted their chat request.
    if (!allContacts.includes(contactID)) {
      return;
    }

    // Check for pending messages that need to be expired.
    expirePendingMessages(contactID);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactID]);

  useEffect(() => {
    if (allContacts.includes(contactID)) {
      setConversationUnreadCount({ contactID, unreadCount: 0 });
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
  }, [conversationCache, contactID]);

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
    updateMessageInConversation({ messageID: message.messageID, message });

    const transmissionMode = connections.includes(contactID) ? 'p2p' : 'mesh';

    // Retry sending message with the same content.
    const textMessage: StoredDirectChatMessage = await sendChatMessageWrapper(
      contactID,
      message.content,
      transmissionMode
    );

    addMessageToConversation(textMessage);

    // Check back in a few seconds to see if the message has failed to go through.
    // This is needed since Bridgefy doesn't always let us know if a message failed to send via messageFailedToSend.
    setTimeout(() => expirePendingMessages(contactID), MESSAGE_PENDING_EXPIRATION_TIME);
  };

  // Send message to contact. Assumes contact exists.
  const sendText = async (text: string) => {
    if (!contactID || !allContacts.includes(contactID) || !allContactsInfo[contactID]) {
      throw new Error('Cannot send message to contact that does not exist');
    }

    if (text.length === 0) {
      return;
    }

    const transmissionMode = connections.includes(contactID) ? 'p2p' : 'mesh';

    // Send message via Bridgefy.
    const textMessage: StoredDirectChatMessage = await sendChatMessageWrapper(
      contactID,
      text,
      transmissionMode
    );

    addMessageToConversation(textMessage);

    // Check back in a few seconds to see if the message has failed to go through.
    // This is needed since Bridgefy doesn't always let us know if a message failed to send via messageFailedToSend.
    setTimeout(() => expirePendingMessages(contactID), MESSAGE_PENDING_EXPIRATION_TIME);
  };

  // Render the bubbles in the chat.
  const renderBubbles = (): JSX.Element => {
    if (!messages) {
      return <View />;
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
    <LinearGradient
      colors={[vars.backgroundColor, vars.backgroundColor, vars.backgroundColorSecondary]}
      style={styles.pageContainer}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      locations={[0, 0.5, 0.51]}
    >
      <SafeAreaView style={[styles.pageContainer]}>
        <ChatHeader navigation={navigation} contactID={contactID} />
        <KeyboardView
          bubbles={renderBubbles()}
          buttonState={!!(contactID && allContacts.includes(contactID))}
          sendText={sendText}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    height: '100%',
    width: '100%',
    flex: 1,
  },
});

export default ChatPage;
