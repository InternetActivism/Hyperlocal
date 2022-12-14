/* eslint-disable react-native/no-inline-styles */
import { Button } from '@rneui/themed';
import { useAtom } from 'jotai';
import React, { createRef, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { ChatHeader, CustomTextInput, TextBubble } from '../../components';
import {
  allContactsAtom,
  connectionInfoAtomInterface,
  conversationCacheAtom,
  getActiveConnectionsAtom,
  updateConversationCacheDeprecated,
} from '../../services/atoms';
import { getConnectionName } from '../../services/connections';
import { getContactInfo, isContact } from '../../services/contacts';
import { ContactInfo, StoredChatMessage } from '../../services/database';
import {
  expirePendingMessages,
  getConversationHistory,
  setMessageWithID,
} from '../../services/stored_messages';
import { sendChatMessageWrapper } from '../../services/transmission';
import { MESSAGE_PENDING_EXPIRATION_TIME, MessageStatus, MessageType } from '../../utils/globals';

interface Props {
  route: any;
  navigation: any;
}

const ChatPage = ({ route, navigation }: Props) => {
  const { user: contactID } = route.params;
  const [conversationCache, setConversationCache] = useAtom(conversationCacheAtom);
  const [connections] = useAtom(getActiveConnectionsAtom);
  const [messageText, setMessageText] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [contactInfo, setLocalContactInfo] = useState<ContactInfo | null>(null);
  const [messages, setMessages] = useState<StoredChatMessage[]>([]);
  const [allContacts] = useAtom(allContactsAtom);
  const [connectionInfo] = useAtom(connectionInfoAtomInterface);

  const input: any = createRef();
  const scrollViewRef: any = useRef();

  /*

    Hooks

  */

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
    updateExpiredMessages();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactID]);

  // Listen to global state of connections and update whether chat is is connected.
  useEffect(() => {
    setIsConnected(connections.includes(contactID));
  }, [connections]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll down when keyboard is shown.
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      scrollDown();
    });
    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

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
  const sendMessageAgain = async (message: StoredChatMessage) => {
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
    await sendChatMessageWrapper(contactID, message.content);

    // Update conversation cache with the new pending message and the old message hidden.
    setConversationCache(
      updateConversationCacheDeprecated(
        contactID,
        getConversationHistory(contactID),
        new Map(conversationCache)
      )
    );

    // Check back in a few seconds to see if the message has failed to go through.
    // This is needed since Bridgefy doesn't always let us know if a message failed to send via messageFailedToSend.
    setTimeout(() => updateExpiredMessages(), MESSAGE_PENDING_EXPIRATION_TIME);
  };

  // Send message to contact. Assumes contact exists.
  const sendText = async (text: string) => {
    if (!contactID || !isContact(contactID) || !contactInfo) {
      throw new Error('Cannot send message to contact that does not exist');
    }

    input.current.clear();
    setMessageText('');

    // Send message via Bridgefy.
    await sendChatMessageWrapper(contactID, text);

    // Update conversation cache with new pending message.
    // This'll be updated to a sent message once the message is confirmed to have been sent via the onMessageSent callback.
    // Find that in the App.tsx file.
    setConversationCache(
      updateConversationCacheDeprecated(
        contactID,
        getConversationHistory(contactID),
        new Map(conversationCache)
      )
    );

    // Check back in a few seconds to see if the message has failed to go through.
    // This is needed since Bridgefy doesn't always let us know if a message failed to send via messageFailedToSend.
    setTimeout(() => updateExpiredMessages(), MESSAGE_PENDING_EXPIRATION_TIME);
  };

  const updateExpiredMessages = () => {
    // Check for any pending messages that have expired.
    const didExpire = expirePendingMessages(contactID);

    // If any pending messages have expired, update the conversation cache.
    // This will cause the chat page to re-render.
    if (didExpire) {
      setConversationCache(
        updateConversationCacheDeprecated(
          contactID,
          getConversationHistory(contactID),
          new Map(conversationCache)
        )
      );
    }
  };

  // Scroll down to bottom of chat.
  const scrollDown = () => {
    if (scrollViewRef.current === null) {
      return;
    }
    scrollViewRef.current.scrollToEnd({ animated: true });
  };

  // Render the bubbles in the chat.
  const renderBubbles = () => {
    if (!messages || messages.length === 0) {
      return;
    }

    // This uses the local messages state variable.
    // This is updated when the conversation cache changes.
    return messages.map((message: StoredChatMessage) => {
      // Do not show deleted messages and nickname change messages.
      if (
        message.typeFlag === MessageType.NICKNAME_UPDATE ||
        message.statusFlag === MessageStatus.DELETED
      ) {
        return null;
      }

      // Show failed messages with a retry on click.
      if (message.statusFlag === MessageStatus.FAILED) {
        return <TextBubble message={message} callback={() => sendMessageAgain(message)} />;
      }

      // Normal messages.
      return <TextBubble message={message} />;
    });
  };

  // Wait for contactID to be set before rendering.
  if (!contactID) {
    return <View />;
  }

  // This means this is a chat with user that has not accepted chat request.
  if (!contactInfo || allContacts.includes(contactID) === false) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ChatHeader
          navigation={navigation}
          contactID={contactID}
          isConnected={isConnected}
          isContact={false}
          lastSeen={0}
          name={getConnectionName(contactID, connectionInfo)}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView
            style={{ backgroundColor: '#fff', flex: 1 }}
            ref={scrollViewRef}
            onContentSizeChange={() => scrollDown()}
          >
            {renderBubbles()}
          </ScrollView>
          <View style={styles.inputContainer}>
            <CustomTextInput
              ref={input}
              text={messageText}
              onChangeText={(value: string) => {
                setMessageText(value);
              }}
            />
            <Button
              title="^"
              buttonStyle={styles.sendButton}
              disabled={true}
              onPress={() => sendText(messageText)}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // This means this is a chat with a user that has accepted chat request.
  // This is the normal chat page.
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ChatHeader
        navigation={navigation}
        contactID={contactID}
        isConnected={isConnected}
        isContact={true}
        lastSeen={contactInfo.lastSeen}
        name={contactInfo.nickname}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          style={{ backgroundColor: '#fff', flex: 1 }}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollDown()}
        >
          {renderBubbles()}
        </ScrollView>
        <View style={styles.inputContainer}>
          <CustomTextInput
            ref={input}
            text={messageText}
            onChangeText={(value: string) => {
              setMessageText(value);
            }}
          />
          <Button
            title="^"
            buttonStyle={styles.sendButton}
            disabled={messageText === ''}
            onPress={() => sendText(messageText)}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2F7BF5',
    marginRight: 10,
  },
});

export default ChatPage;
