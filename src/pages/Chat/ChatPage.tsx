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
import { getContactInfo, isContact, setContactInfo } from '../../services/database/contacts';
import {
  ContactInfo,
  StoredDirectMessage,
  sendMessageWrapper,
  getContactsArray,
  updateConversationCache,
} from '../../services/database/database';
import { getConversationHistory, setMessageWithID } from '../../services/database/messages';

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
  const [messages, setMessages] = useState<StoredDirectMessage[]>([]);
  const [, setAllUsers] = useAtom(allContactsAtom);

  const input: any = createRef();
  const scrollViewRef: any = useRef();

  /*

    Hooks

  */

  // get contact info
  useEffect(() => {
    if (!contactID) {
      return;
    }
    if (isContact(contactID)) {
      setLocalContactInfo(getContactInfo(contactID));
    } else {
      // user opened chat with someone who is not in their contacts
      const newContact = setContactInfo(contactID, {
        contactID: contactID,
        username: '',
        nickname: contactID,
        contactFlags: 0,
        verified: false, // used in future versions
        lastSeen: -1,
      });
      setLocalContactInfo(newContact);
      setAllUsers(getContactsArray());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactID]);

  // listen to global state of connections and update whether chat is isConnected
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

  const sendMessageAgain = async (message: StoredDirectMessage) => {
    if (message.statusFlag !== 2) {
      console.log('(sendMessageAgain) Message is not a failed message', message);
      return;
    }

    message.statusFlag = 3; // set to deleted flag
    setMessageWithID(message.messageID, message);

    // retry sending message with new index and timestamp
    await sendMessageWrapper(contactID, {
      content: message.content,
      flags: 0,
      createdAt: Date.now(),
    });

    // update conversation cache for UI updates
    setConversationCache(
      updateConversationCache(
        contactID,
        getConversationHistory(contactID),
        new Map(conversationCache)
      )
    );
  };

  // send message to contact
  const sendText = async (text: string) => {
    input.current.clear();
    setMessageText('');
    // won't send a message unless the contact exists
    if (text !== '' && contactInfo) {
      await sendMessageWrapper(contactID, { content: text, flags: 0, createdAt: Date.now() });

      // update conversation cache for UI updates
      setConversationCache(
        updateConversationCache(
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
    if (!messages || messages.length === 0) return;
    return messages.map((message: StoredDirectMessage) => {
      // do not show deleted messages and username change messages
      if (message.typeFlag === 1 || message.statusFlag === 3) {
        return null;
      }

      // show failed messages with a retry on click
      if (message.statusFlag === 2) {
        // call send message again on click
        return <TextBubble message={message} callback={() => sendMessageAgain(message)} />;
      }

      return <TextBubble message={message} />;
    });
  };

  if (contactInfo === undefined || !contactID) {
    return <View />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ChatHeader
        navigation={navigation}
        contactID={contactID}
        isConnected={isConnected}
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
            // disabled={!isConnected}
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
