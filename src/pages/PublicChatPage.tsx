import { Text } from '@rneui/base';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { default as React, useEffect, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PublicChatHeader } from '../components/features/PublicChat';
import KeyboardView from '../components/ui/ChatKeyboardView';
import InfoIcon from '../components/ui/Icons/InfoIcon';
import PublicChatTextBubble from '../components/ui/PublicChatTextBubble';
import {
  allContactsAtom,
  currentUserInfoAtom,
  getActiveConnectionsAtom,
  publicChatCacheAtom,
} from '../services/atoms';
import {
  addMessageToPublicChatAtom,
  expirePublicPendingMessagesAtom,
  setUnreadCountPublicChatAtom,
  updateMessageInPublicChatAtom,
} from '../services/atoms/public_chat';
import { StoredPublicChatMessage } from '../services/database';
import { sendPublicChatMessageWrapper } from '../services/transmission';
import { MessageStatus, MESSAGE_PENDING_EXPIRATION_TIME } from '../utils/globals';
import { vars } from '../utils/theme';
import QAndAModal from './QAndAModal';

interface Props {
  navigation: any;
}

const PublicChatPage = ({ navigation }: Props) => {
  const [userInfo] = useAtom(currentUserInfoAtom);
  const publicChatCache = useAtomValue(publicChatCacheAtom);
  const [connections] = useAtom(getActiveConnectionsAtom);
  const [numConnected, setNumConnected] = useState<number>(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const contacts = useAtomValue(allContactsAtom);
  const addMessageToPublicChat = useSetAtom(addMessageToPublicChatAtom);
  const updateMessageInPublicChat = useSetAtom(updateMessageInPublicChatAtom);
  const expirePendingPublicMessages = useSetAtom(expirePublicPendingMessagesAtom);
  const setUnreadCountPublicChat = useSetAtom(setUnreadCountPublicChatAtom);

  // TODO: Fix this later cause page refresh when allContacts changes.
  // Runs on mount. Sets up the chat page.
  useEffect(() => {
    if (!userInfo.userID) {
      return;
    }

    // Reset the public chat unread count.
    setUnreadCountPublicChat(0);

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

    if (text.length === 0) {
      return;
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
        {publicChatCache.history.map((message: StoredPublicChatMessage, index: number) => {
          // Do not show deleted messages and nickname change messages.
          if (message.statusFlag === MessageStatus.DELETED) {
            return null;
          }

          // Show failed messages with a retry on click.
          if (message.statusFlag === MessageStatus.FAILED) {
            return (
              <PublicChatTextBubble
                key={message.messageID}
                showName={false}
                message={message}
                isContact={contacts.includes(message.senderID)}
                callback={() => sendMessageAgain(message)}
              />
            );
          }

          // Normal messages.
          return (
            <PublicChatTextBubble
              showName={
                index === 0 || message.senderID !== publicChatCache.history[index - 1].senderID
              }
              key={message.messageID}
              isContact={contacts.includes(message.senderID)}
              message={message}
            />
          );
        })}
      </>
    );
  };

  if (!userInfo.userID) {
    return <View />;
  }

  return (
    <>
      <LinearGradient
        colors={[vars.backgroundColor, vars.backgroundColor, vars.backgroundColorSecondary]}
        style={styles.pageContainer}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        locations={[0, 0.5, 0.51]}
      >
        <SafeAreaView style={styles.pageContainer}>
          <PublicChatHeader navigation={navigation} numConnected={numConnected} />
          <TouchableOpacity
            style={styles.meshBannerContainer}
            onPress={() => setIsModalVisible(true)}
          >
            <View style={styles.meshBannerLine} />
            <View style={styles.meshBannerContent}>
              <Text style={styles.meshBannerText}>Messages sent and received via Mesh</Text>
              <InfoIcon />
            </View>
            <View style={styles.meshBannerLine} />
          </TouchableOpacity>
          <KeyboardView
            bubbles={renderBubbles()}
            buttonState={Boolean(numConnected > 0)}
            sendText={sendText}
          />
        </SafeAreaView>
      </LinearGradient>
      <Modal
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <QAndAModal
          setIsModalVisible={setIsModalVisible}
          title={'Public Chat via\nMesh Network'}
          content={[
            {
              question: 'What is Public Chat via Mesh Network?',
              answer:
                "Public Chat via Mesh Network is a decentralized communication method that allows you to join a group chat with everyone connected within the area, even if they're not directly connected to you.",
            },
            {
              question: 'How does it work?',
              answer:
                'All messages in the Public Chat are encrypted for privacy and security, then passed along from one user to another within the network. This enables a dynamic group chat experience that works over a mesh network.',
            },
            {
              question: 'Is message delivery guaranteed?',
              answer:
                'No, message delivery is not guaranteed as it depends on the connections between users within the network. However, the more users connected within the area, the higher the chance of messages being delivered.',
            },
          ]}
        />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    height: '100%',
    width: '100%',
    flex: 1,
  },
  meshBannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: vars.backgroundColor,
    paddingVertical: 5,
  },
  meshBannerLine: { backgroundColor: '#4F4F4F', height: 1, flex: 1 },
  meshBannerContent: {
    paddingHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  meshBannerText: {
    fontFamily: vars.fontFamilySecondary,
    fontWeight: vars.fontWeightRegular,
    fontSize: 12,
    color: '#E7E7E7',
    marginRight: 3,
  },
});

export default PublicChatPage;
