import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { RootStackParamList } from '../App';
import ChatHeader from '../components/features/Chat/ChatHeader';
import KeyboardView from '../components/ui/ChatKeyboardView';
import TextBubble from '../components/ui/TextBubble';
import {
  allContactsAtom,
  connectionInfoAtomInterface,
  contactInfoAtom,
  conversationCacheAtom,
  getActiveConnectionsAtom,
} from '../services/atoms';
import {
  addMessageToConversationAtom,
  expirePendingMessagesAtom,
  setConversationUnreadCountAtom,
  updateMessageInConversationAtom,
} from '../services/atoms/conversation';
import { getConnectionName } from '../services/connections';
import { StoredDirectChatMessage } from '../services/database';
import { sendChatMessageWrapper } from '../services/transmission';
import { MessageStatus, MessageType, MESSAGE_PENDING_EXPIRATION_TIME } from '../utils/globals';
import { vars } from '../utils/theme';

type NavigationProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;

const ChatPage = ({ route, navigation }: NavigationProps) => {
  const { user: contactID } = route.params;
  const conversationCache = useAtomValue(conversationCacheAtom);
  const [connections] = useAtom(getActiveConnectionsAtom);
  const [messages, setMessages] = useState<StoredDirectChatMessage[]>([]);
  const [allContacts] = useAtom(allContactsAtom);
  const [connectionInfo] = useAtom(connectionInfoAtomInterface);
  const [allContactsInfo] = useAtom(contactInfoAtom);
  const [isAcceptedRequest, setIsAcceptedRequest] = useState<boolean>(false);
  const addMessageToConversation = useSetAtom(addMessageToConversationAtom);
  const updateMessageInConversation = useSetAtom(updateMessageInConversationAtom);
  const expirePendingMessages = useSetAtom(expirePendingMessagesAtom);
  const setConversationUnreadCount = useSetAtom(setConversationUnreadCountAtom);

  /*

    Hooks

  */

  // Cause page refresh when allContacts changes.
  useEffect(() => {
    if (contactID && allContacts.includes(contactID)) {
      console.log('ChatPage refresh with', contactID);
      setIsAcceptedRequest(true);
    }
  }, [allContacts, connections, contactID]);

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
    updateMessageInConversation({ messageID: message.messageID, message });

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
    if (!contactID || !allContacts.includes(contactID) || !allContactsInfo[contactID]) {
      throw new Error('Cannot send message to contact that does not exist');
    }

    if (text.length === 0) {
      return;
    }

    // Send message via Bridgefy.
    const textMessage: StoredDirectChatMessage = await sendChatMessageWrapper(contactID, text);

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
    <SafeAreaView style={[styles.pageContainer]}>
      <View>
        {isAcceptedRequest ? (
          <ChatHeader
            navigation={navigation}
            contactID={contactID}
            isContact={true}
            name={allContactsInfo[contactID]!.nickname}
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
        buttonState={!!(contactID && allContacts.includes(contactID) && isAcceptedRequest)}
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
