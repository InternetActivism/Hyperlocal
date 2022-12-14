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
  conversationCacheAtom,
  getActiveConnectionsAtom,
} from '../../services/atoms';
import { getContactInfo, isContact } from '../../services/database/contacts';
import {
  ContactInfo,
  StoredChatMessage,
  sendChatMessageWrapper,
  updateConversationCacheDeprecated,
} from '../../services/database/database';
import {
  expirePendingMessages,
  getConversationHistory,
  setMessageWithID,
} from '../../services/database/messages';
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
  const [contactInfo, setLocalContactInfo] = useState<ContactInfo>({} as ContactInfo);
  const [messages, setMessages] = useState<StoredChatMessage[]>([]);
  const [allContacts] = useAtom(allContactsAtom);

  const input: any = createRef();
  const scrollViewRef: any = useRef();

  /*

    Hooks

  */

  // called on load
  useEffect(() => {
    if (!contactID) {
      return;
    }

    // user opened chat with someone who has not accepted their chat request
    if (!isContact(contactID)) {
      return;
    }

    setLocalContactInfo(getContactInfo(contactID));

    const didExpire = expirePendingMessages(contactID);
    // update conversation cache if a message expired
    if (didExpire) {
      setConversationCache(
        updateConversationCacheDeprecated(
          contactID,
          getConversationHistory(contactID),
          new Map(conversationCache)
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactID]);

  // listen to global state of connections and update whether chat is is connected
  useEffect(() => {
    setIsConnected(connections.includes(contactID));
  }, [connections]); // eslint-disable-line react-hooks/exhaustive-deps

  // scroll down when keyboard is shown
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      scrollDown();
    });
    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  // update local messages when conversation cache changes
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

  const sendMessageAgain = async (message: StoredChatMessage) => {
    console.log('(sendMessageAgain) Message to retry', message);
    if (message.statusFlag !== MessageStatus.FAILED) {
      console.log('(sendMessageAgain) Message is not a failed message', message);
      return;
    }

    message.statusFlag = MessageStatus.DELETED; // set to deleted flag
    setMessageWithID(message.messageID, message);

    // retry sending message with new index and timestamp
    await sendChatMessageWrapper(contactID, message.content);

    // update conversation cache for UI updates
    setConversationCache(
      updateConversationCacheDeprecated(
        contactID,
        getConversationHistory(contactID),
        new Map(conversationCache)
      )
    );

    setTimeout(() => updateExpiredMessages(), MESSAGE_PENDING_EXPIRATION_TIME);
  };

  // Send message to contact. Assumes contact exists.
  const sendText = async (text: string) => {
    if (!contactID || !isContact(contactID) || !contactInfo) {
      throw new Error('Cannot send message to contact that does not exist');
    }

    input.current.clear();
    setMessageText('');

    await sendChatMessageWrapper(contactID, text);

    // update conversation cache for UI updates
    setConversationCache(
      updateConversationCacheDeprecated(
        contactID,
        getConversationHistory(contactID),
        new Map(conversationCache)
      )
    );

    // create timeout to check for expired messages when called
    setTimeout(() => updateExpiredMessages(), MESSAGE_PENDING_EXPIRATION_TIME);
  };

  const updateExpiredMessages = () => {
    const didExpire = expirePendingMessages(contactID);
    // update conversation cache if a message expired
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

  // scroll down to bottom of chat
  const scrollDown = () => {
    if (scrollViewRef.current === null) {
      return;
    }
    scrollViewRef.current.scrollToEnd({ animated: true });
  };

  // render all messages in conversation
  const renderBubbles = () => {
    if (!messages || messages.length === 0) {
      return;
    }
    return messages.map((message: StoredChatMessage) => {
      // do not show deleted messages and nickname change messages
      if (
        message.typeFlag === MessageType.NICKNAME_UPDATE ||
        message.statusFlag === MessageStatus.DELETED
      ) {
        return null;
      }

      // show failed messages with a retry on click
      if (message.statusFlag === MessageStatus.FAILED) {
        // call send message again on click
        return <TextBubble message={message} callback={() => sendMessageAgain(message)} />;
      }

      return <TextBubble message={message} />;
    });
  };

  if (!contactID) {
    return <View />;
  }

  // chat with user that has not accepted chat request
  if (contactInfo === undefined || allContacts.includes(contactID) === false) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ChatHeader
          navigation={navigation}
          contactID={contactID}
          isConnected={isConnected}
          isContact={false}
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
              disabled={true}
              onPress={() => sendText(messageText)}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

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
