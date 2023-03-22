import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { default as React, useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { PublicChatHeader } from '../../components/features/PublicChat';
import KeyboardView from '../../components/ui/ChatKeyboardView';
import PublicChatTextBubble from '../../components/ui/PublicChatTextBubble';
import {
  currentUserInfoAtom,
  getActiveConnectionsAtom,
  publicChatCacheAtom,
} from '../../services/atoms';
import {
  addMessageToPublicChatAtom,
  expirePublicPendingMessagesAtom,
  updateMessageInPublicChatAtom,
} from '../../services/atoms/public_chat';
import { StoredPublicChatMessage } from '../../services/database';
import { sendPublicChatMessageWrapper } from '../../services/transmission';
import { MessageStatus, MESSAGE_PENDING_EXPIRATION_TIME } from '../../utils/globals';
import { vars } from '../../utils/theme';

interface Props {
  navigation: any;
}

const PublicChatPage = ({ navigation }: Props) => {
  const [userInfo] = useAtom(currentUserInfoAtom);
  const publicChatCache = useAtomValue(publicChatCacheAtom);
  const [connections] = useAtom(getActiveConnectionsAtom);
  const [numConnected, setNumConnected] = useState<number>(0);
  const addMessageToPublicChat = useSetAtom(addMessageToPublicChatAtom);
  const updateMessageInPublicChat = useSetAtom(updateMessageInPublicChatAtom);
  const expirePendingPublicMessages = useSetAtom(expirePublicPendingMessagesAtom);

  // TODO: Fix this later cause page refresh when allContacts changes.
  // Runs on mount. Sets up the chat page.
  useEffect(() => {
    if (!userInfo.userID) {
      return;
    }

    // Check for pending messages that need to be expired.
    expirePendingPublicMessages();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen to global state of connections and update whether chat is is connected.
  useEffect(() => {
    setNumConnected(connections.length);
  }, [connections]);

  // Runs when a user clicks on a failed message to retry sending it.
  const sendMessageAgain = async (message: StoredPublicChatMessage) => {
    console.log('(sendMessageAgain) Message to retry', message);

    if (!userInfo.userID) {
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
    updateMessageInPublicChat({ messageID: message.messageID, message });

    // Retry sending message with the same content.
    const sentMessage: StoredPublicChatMessage = await sendPublicChatMessageWrapper(
      userInfo.nickname,
      userInfo.userID,
      message.content
    );

    addMessageToPublicChat(sentMessage);

    // Check back in a few seconds to see if the message has failed to go through.
    // This is needed since Bridgefy doesn't always let us know if a message failed to send via messageFailedToSend.
    setTimeout(() => expirePendingPublicMessages(), MESSAGE_PENDING_EXPIRATION_TIME);
  };

  // Send message to contact. Assumes contact exists.
  const sendText = async (text: string) => {
    if (!userInfo.userID) {
      throw new Error('Cannot send message without a loaded user.');
    }

    // Send message via Bridgefy.
    const sentMessage: StoredPublicChatMessage = await sendPublicChatMessageWrapper(
      userInfo?.nickname,
      userInfo.userID,
      text
    );

    addMessageToPublicChat(sentMessage);

    // Check back in a few seconds to see if the message has failed to go through.
    // This is needed since Bridgefy doesn't always let us know if a message failed to send via messageFailedToSend.
    setTimeout(() => expirePendingPublicMessages(), MESSAGE_PENDING_EXPIRATION_TIME);
  };

  // Render the bubbles in the chat.
  const renderBubbles = (): JSX.Element => {
    if (!publicChatCache.history || publicChatCache.history.length === 0) {
      return <View />;
    }

    // This uses the local messages state variable.
    // This is updated when the conversation cache changes.
    return (
      <>
        {publicChatCache.history.map((message: StoredPublicChatMessage) => {
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

  if (!userInfo.userID) {
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
