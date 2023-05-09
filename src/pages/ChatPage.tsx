import { StackScreenProps } from '@react-navigation/stack';
import { Text } from '@rneui/base';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, StyleSheet, View } from 'react-native';
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
import {
  MessageStatus,
  MessageType,
  MESSAGE_PENDING_EXPIRATION_TIME,
  TransmissionMode,
} from '../utils/globals';
import { vars } from '../utils/theme';
import { dateFromTimestamp } from '../utils/time';
import QAndAModal from './QAndAModal';

type NavigationProps = StackScreenProps<RootStackParamList, 'Chat'>;

const ChatPage = ({ route, navigation }: NavigationProps) => {
  const { user: contactID } = route.params;
  const conversationCache = useAtomValue(conversationCacheAtom);
  const [messages, setMessages] = useState<StoredDirectChatMessage[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [allContacts] = useAtom(allContactsAtom);
  const allContactsInfo = useAtomValue(contactInfoAtom);
  const [connections] = useAtom(activeConnectionsAtom);
  const addMessageToConversation = useSetAtom(addMessageToConversationAtom);
  const updateMessageInConversation = useSetAtom(updateMessageInConversationAtom);
  const expirePendingMessages = useSetAtom(expirePendingMessagesAtom);
  const setConversationUnreadCount = useSetAtom(setConversationUnreadCountAtom);
  const overlayOpacityValue = useRef(new Animated.Value(0)).current;

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

    const contactInfo = allContactsInfo[contactID];
    const transmissionMode = connections.includes(contactID)
      ? TransmissionMode.P2P
      : TransmissionMode.MESH;

    // Retry sending message with the same content.
    const textMessage: StoredDirectChatMessage = await sendChatMessageWrapper(
      contactID,
      message.content,
      transmissionMode,
      contactInfo.lastMsgPointer
    );

    addMessageToConversation(textMessage);

    // Check back in a few seconds to see if the message has failed to go through.
    // This is needed since Bridgefy doesn't always let us know if a message failed to send via messageFailedToSend.
    setTimeout(
      () => expirePendingMessages({ contactID, sentMessageID: textMessage.messageID }),
      MESSAGE_PENDING_EXPIRATION_TIME
    );
  };

  // Send message to contact. Assumes contact exists.
  const sendText = async (text: string) => {
    if (!contactID || !allContacts.includes(contactID) || !allContactsInfo[contactID]) {
      throw new Error('Cannot send message to contact that does not exist');
    }

    if (text.length === 0) {
      return;
    }

    const contactInfo = allContactsInfo[contactID];
    const transmissionMode = connections.includes(contactID)
      ? TransmissionMode.P2P
      : TransmissionMode.MESH;

    // Send message via Bridgefy.
    const textMessage: StoredDirectChatMessage = await sendChatMessageWrapper(
      contactID,
      text,
      transmissionMode,
      contactInfo.lastMsgPointer
    );

    addMessageToConversation(textMessage);

    // Check back in a few seconds to see if the message has failed to go through.
    // This is needed since Bridgefy doesn't always let us know if a message failed to send via messageFailedToSend.
    setTimeout(
      () => expirePendingMessages({ contactID, sentMessageID: textMessage.messageID }),
      MESSAGE_PENDING_EXPIRATION_TIME
    );
  };

  // Render the bubbles in the chat.
  const renderBubbles = (): JSX.Element => {
    if (!messages) {
      return <View />;
    }

    const messageViews: JSX.Element[] = [];

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const messageTime = message.isReceiver ? message.receivedAt : message.createdAt;
      const messageDate = new Date(messageTime);

      if (
        message.typeFlag === MessageType.NICKNAME_UPDATE ||
        message.statusFlag === MessageStatus.DELETED
      ) {
        continue;
      }

      let nextMessage: StoredDirectChatMessage | undefined;
      for (let j = i + 1; j < messages.length; j++) {
        if (messages[j].typeFlag === MessageType.TEXT) {
          nextMessage = messages[j];
          break;
        }
      }

      const showDelivered =
        message.statusFlag === MessageStatus.DELIVERED &&
        message.isReceiver === false &&
        (!nextMessage ||
          nextMessage.isReceiver === true ||
          nextMessage.statusFlag !== MessageStatus.DELIVERED);

      let showDate = true;

      if (i > 0) {
        const previousMessageTime = messages[i - 1].isReceiver
          ? messages[i - 1].receivedAt
          : messages[i - 1].createdAt;
        const previousDate = new Date(previousMessageTime);

        if (
          previousDate.getDate() === messageDate.getDate() &&
          previousDate.getMonth() === messageDate.getMonth() &&
          previousDate.getFullYear() === messageDate.getFullYear()
        ) {
          showDate = false;
        }
      }

      if (showDate) {
        messageViews.push(
          <View style={styles.dateBannerContainer} key={messageTime}>
            <View style={styles.dateBannerLine} />
            <View style={styles.dateBannerContent}>
              <Text style={styles.dateBannerText}>{dateFromTimestamp(messageTime)}</Text>
            </View>
            <View style={styles.dateBannerLine} />
          </View>
        );
      }

      // Show failed messages with a retry on click.
      if (message.statusFlag === MessageStatus.FAILED) {
        messageViews.push(
          <TextBubble
            key={message.messageID}
            message={message}
            callback={() => sendMessageAgain(message)}
            setIsModalVisible={setIsModalVisible}
            showDelivered={showDelivered}
          />
        );
        continue;
      }

      // Normal messages.
      messageViews.push(
        <TextBubble
          key={message.messageID}
          message={message}
          setIsModalVisible={setIsModalVisible}
          showDelivered={showDelivered}
        />
      );
    }

    return <>{messageViews}</>;
  };

  // Wait for contactID to be set before rendering.
  if (!contactID) {
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
        <SafeAreaView style={[styles.pageContainer]}>
          <View>
            <Animated.View
              style={[
                styles.overlay,
                {
                  opacity: overlayOpacityValue,
                },
              ]}
              pointerEvents="none"
            />
            <ChatHeader navigation={navigation} contactID={contactID} />
          </View>
          <KeyboardView
            bubbles={renderBubbles()}
            buttonState={
              contactID && allContacts.includes(contactID) && connections.includes(contactID)
                ? 'Enabled'
                : connections.length !== 0 && contactID && allContacts.includes(contactID)
                ? 'Mesh'
                : 'Disabled'
            }
            sendTextHandler={sendText}
            placeholders={{
              Enabled: 'Chat securely via Bluetooth connection',
              Mesh: 'Chat securely via Mesh network',
              Disabled: 'Mesh unavailable, no nearby users',
            }}
            overlayOpacityValue={overlayOpacityValue}
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
          title="Mesh Network Messaging"
          content={[
            {
              question: 'What is Mesh Network Messaging?',
              answer:
                "Mesh Network Messaging is a decentralized communication method that allows you to send encrypted messages to recipients, even when they're not directly connected to you.",
            },
            {
              question: 'How does it work?',
              answer:
                'Your message is encrypted for privacy and security, then passed along from one user to another within the network until it reaches the intended recipient.',
            },
            {
              question: 'Is message delivery guaranteed?',
              answer:
                'No, message delivery is not guaranteed as it depends on the connections between users within the network.',
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
  dateBannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: vars.backgroundColor,
    paddingVertical: 5,
  },
  dateBannerLine: { backgroundColor: '#4F4F4F', height: 1, flex: 1 },
  dateBannerContent: {
    paddingHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateBannerText: {
    fontFamily: vars.fontFamilyPrimary,
    fontWeight: vars.fontWeightMedium,
    fontSize: 12,
    color: '#8C8C8C',
    marginRight: 3,
  },
  overlay: {
    position: 'absolute',
    zIndex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: vars.backgroundColor,
  },
});

export default ChatPage;
