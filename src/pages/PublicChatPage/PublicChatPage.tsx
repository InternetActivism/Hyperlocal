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
import { CustomTextInput } from '../../components';
import { PublicChatHeader } from '../../components/features/PublicChat';
import SendIcon from '../../components/ui/Icons/SendIcon/SendIcon';
import SendIconDisabled from '../../components/ui/Icons/SendIcon/SendIconDisabled';
import PublicChatTextBubble from '../../components/ui/PublicChatTextBubble';
import {
  currentUserInfoAtom,
  getActiveConnectionsAtom,
  publicChatCacheAtom,
} from '../../services/atoms';
import { StoredPublicChatMessage } from '../../services/database';
import {
  expirePublicPendingMessages,
  getPublicChatConversation,
  setPublicMessageWithID,
} from '../../services/public_chat';
import { sendPublicChatMessageWrapper } from '../../services/transmission';
import { MessageStatus, MESSAGE_PENDING_EXPIRATION_TIME } from '../../utils/globals';
import { vars } from '../../utils/theme';

interface Props {
  route: any;
  navigation: any;
}

const PublicChatPage = ({ navigation }: Props) => {
  const [userInfo] = useAtom(currentUserInfoAtom);
  const [publicChatCache, setPublicChatCache] = useAtom(publicChatCacheAtom);
  const [connections] = useAtom(getActiveConnectionsAtom);
  const [messageText, setMessageText] = useState<string>('');
  const [numConnected, setNumConnected] = useState<number>(0);
  const [messages, setMessages] = useState<StoredPublicChatMessage[]>([]);

  const input: any = createRef();
  const scrollViewRef: any = useRef();

  const isMessageDisabled = messageText === '';

  /*

    Hooks

  */

  // Cause page refresh when allContacts changes.
  // useEffect(() => {
  //   if (contactID) {
  //     setLocalContactInfo(getContactInfo(contactID));
  //   }
  // }, [allContacts]); // eslint-disable-line react-hooks/exhaustive-deps

  // Runs on mount. Sets up the chat page.
  useEffect(() => {
    if (!userInfo) {
      return;
    }

    // Check for pending messages that need to be expired.
    updateExpiredMessages();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen to global state of connections and update whether chat is is connected.
  useEffect(() => {
    setNumConnected(connections.length);
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
    if (!userInfo) {
      return;
    }
    if (publicChatCache) {
      setMessages(publicChatCache.history);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicChatCache]);

  /*

    Functions

  */

  // Runs when a user clicks on a failed message to retry sending it.
  const sendMessageAgain = async (message: StoredPublicChatMessage) => {
    console.log('(sendMessageAgain) Message to retry', message);

    if (!userInfo) {
      throw new Error('Cannot send message without a loaded user.');
    }

    // Should not happen, remove once we are confident this is not happening.
    if (message.statusFlag !== MessageStatus.FAILED) {
      console.log('(sendMessageAgain) Message is not a failed message', message);
      return;
    }

    // Hide the old message to be retried.
    // Doesn't actually delete the message from the database, just hides it.
    message.statusFlag = MessageStatus.DELETED;
    setPublicMessageWithID(message.messageID, message);

    // Retry sending message with the same content.
    await sendPublicChatMessageWrapper(userInfo?.nickname, userInfo.userID, message.content);

    // Update conversation cache with the new pending message and the old message hidden, using the database as a reference.
    setPublicChatCache({ history: getPublicChatConversation(), lastUpdated: Date.now() });

    // Check back in a few seconds to see if the message has failed to go through.
    // This is needed since Bridgefy doesn't always let us know if a message failed to send via messageFailedToSend.
    setTimeout(() => updateExpiredMessages(), MESSAGE_PENDING_EXPIRATION_TIME);
  };

  // Send message to contact. Assumes contact exists.
  const sendText = async (text: string) => {
    if (!userInfo) {
      throw new Error('Cannot send message without a loaded user.');
    }

    input.current.clear();
    setMessageText('');

    // Send message via Bridgefy.
    await sendPublicChatMessageWrapper(userInfo?.nickname, userInfo.userID, text);

    // Update conversation cache with new pending message.
    // This'll be updated to a sent message once the message is confirmed to have been sent via the onMessageSent callback.
    // Find that in the App.tsx file.
    setPublicChatCache({ history: getPublicChatConversation(), lastUpdated: Date.now() });

    // Check back in a few seconds to see if the message has failed to go through.
    // This is needed since Bridgefy doesn't always let us know if a message failed to send via messageFailedToSend.
    setTimeout(() => updateExpiredMessages(), MESSAGE_PENDING_EXPIRATION_TIME);
  };

  const updateExpiredMessages = () => {
    // Check for any pending messages that have expired.
    const didExpire = expirePublicPendingMessages();

    // If any pending messages have expired, update the conversation cache.
    // This will cause the chat page to re-render.
    if (didExpire) {
      setPublicChatCache({ history: getPublicChatConversation(), lastUpdated: Date.now() });
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
    return messages.map((message: StoredPublicChatMessage) => {
      // Do not show deleted messages and nickname change messages.
      if (message.statusFlag === MessageStatus.DELETED) {
        return null;
      }

      // Show failed messages with a retry on click.
      if (message.statusFlag === MessageStatus.FAILED) {
        return (
          <PublicChatTextBubble
            key={message.messageID}
            message={message}
            callback={() => sendMessageAgain(message)}
          />
        );
      }

      // Normal messages.
      return <PublicChatTextBubble key={message.messageID} message={message} />;
    });
  };

  // Wait for contactID to be set before rendering.
  if (!userInfo) {
    return <View />;
  }

  return (
    <SafeAreaView style={[styles.pageContainer]}>
      <View>
        <PublicChatHeader navigation={navigation} numConnected={numConnected} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollContainer}
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
            icon={isMessageDisabled ? <SendIconDisabled /> : <SendIcon />}
            buttonStyle={styles.sendButton}
            disabledStyle={styles.sendButtonDisabled}
            disabled={isMessageDisabled}
            onPress={() => sendText(messageText)}
          />
        </View>
      </KeyboardAvoidingView>
      {/* Adding a spacer at the bottom so that we don't take the entire chunk when we use keyboard */}
      <View style={styles.spacer} />
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
  container: {
    flex: 1,
  },
  scrollContainer: {
    backgroundColor: vars.backgroundColor,
    paddingTop: 10,
    paddingBottom: 10,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: vars.backgroundColorSecondary,
    paddingTop: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: vars.backgroundColorSecondary,
  },
  sendButtonDisabled: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: vars.backgroundColorSecondary,
  },
  spacer: {
    height: 25,
    backgroundColor: vars.backgroundColorSecondary,
  },
  shadow: {
    shadowColor: vars.black.sharp,
    shadowOpacity: 100,
    shadowRadius: 10,
    shadowOffset: { width: 1, height: 1 },
  },
});

export default PublicChatPage;
