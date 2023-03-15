import { useAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { PublicChatHeader } from '../../components/features/PublicChat';
import KeyboardView from '../../components/ui/ChatKeyboardView';
import PublicChatTextBubble from '../../components/ui/PublicChatTextBubble';
import {
  currentUserInfoAtom,
  getActiveConnectionsAtom,
  publicChatCacheAtom,
} from '../../services/atoms';
import { StoredPublicChatMessage } from '../../services/database';
import { setMessageWithID } from '../../services/message_storage';
import {
  expirePublicPendingMessages,
  getPublicChatConversation,
} from '../../services/public_messages';
import { sendPublicChatMessageWrapper } from '../../services/transmission';
import { MessageStatus, MESSAGE_PENDING_EXPIRATION_TIME } from '../../utils/globals';
import { vars } from '../../utils/theme';

interface Props {
  navigation: any;
}

const PublicChatPage = ({ navigation }: Props) => {
  const [userInfo] = useAtom(currentUserInfoAtom);
  const [publicChatCache, setPublicChatCache] = useAtom(publicChatCacheAtom);
  const [connections] = useAtom(getActiveConnectionsAtom);
  const [numConnected, setNumConnected] = useState<number>(0);
  const [messages, setMessages] = useState<StoredPublicChatMessage[]>([]);

  // TODO: Fix this later cause page refresh when allContacts changes.
  // Runs on mount. Sets up the chat page.
  useEffect(() => {
    if (!userInfo?.userID) {
      return;
    }

    // Check for pending messages that need to be expired.
    updateExpiredMessages();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen to global state of connections and update whether chat is is connected.
  useEffect(() => {
    setNumConnected(connections.length);
  }, [connections]);

  // Update local messages when conversation cache changes.
  useEffect(() => {
    if (publicChatCache) {
      setMessages(publicChatCache.history);
    }
  }, [publicChatCache]);

  // Runs when a user clicks on a failed message to retry sending it.
  const sendMessageAgain = async (message: StoredPublicChatMessage) => {
    console.log('(sendMessageAgain) Message to retry', message);

    if (!userInfo?.userID) {
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
    setMessageWithID(message.messageID, message);

    // Retry sending message with the same content.
    await sendPublicChatMessageWrapper(userInfo.nickname, userInfo.userID, message.content);

    // Update conversation cache with the new pending message and the old message hidden, using the database as a reference.
    setPublicChatCache({ history: getPublicChatConversation(), lastUpdated: Date.now() });

    // Check back in a few seconds to see if the message has failed to go through.
    // This is needed since Bridgefy doesn't always let us know if a message failed to send via messageFailedToSend.
    setTimeout(() => updateExpiredMessages(), MESSAGE_PENDING_EXPIRATION_TIME);
  };

  // Send message to contact. Assumes contact exists.
  const sendText = async (text: string) => {
    if (!userInfo?.userID) {
      throw new Error('Cannot send message without a loaded user.');
    }

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

  // Render the bubbles in the chat.
  const renderBubbles = () => {
    if (!messages || messages.length === 0) {
      return <View />;
    }

    // This uses the local messages state variable.
    // This is updated when the conversation cache changes.
    return (
      <>
        {messages.map((message: StoredPublicChatMessage) => {
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
        })}
      </>
    );
  };

  if (!userInfo?.userID) {
    return <View />;
  }

  return (
    <SafeAreaView style={[styles.pageContainer]}>
      <View>
        <PublicChatHeader navigation={navigation} numConnected={numConnected} />
      </View>
      <KeyboardView
        bubbles={renderBubbles()}
        buttonState={!!(numConnected > 0)}
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

export default PublicChatPage;
