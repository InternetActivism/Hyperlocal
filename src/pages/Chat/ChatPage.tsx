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
import { connectionsAtomWithListener, messagesRecievedAtom } from '../../services/atoms';
import { getOrCreateContactInfo } from '../../services/database/contacts';
import {
  ContactInfo,
  Message,
  PendingMessage,
  sendMessageWrapper,
} from '../../services/database/database';
import { setMessageAtIndex } from '../../services/database/messages';

interface Props {
  route: any;
  navigation: any;
}

const ChatPage = ({ route, navigation }: Props) => {
  const { user: contactId } = route.params;
  const [messagesRecieved] = useAtom(messagesRecievedAtom);
  const [connections] = useAtom(connectionsAtomWithListener);
  const [messageText, setMessageText] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({} as ContactInfo);
  const [messages, setMessages] = useState<Message[]>([]);
  const [localPendingMessages, setLocalPendingMessages] = useState<Message[]>([]);

  const input: any = createRef();
  const scrollViewRef: any = useRef();

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
    return messages.concat(localPendingMessages).map((message: Message) => {
      // display sent/received messages and failed messages and pending local messages
      // do not show deleted messages and username change messages
      if (message.flags === 0 || message.flags === 4) {
        return <TextBubble message={message} />;
      }
      if (message.flags === 2) {
        // call send message again on click
        return <TextBubble message={message} callback={() => sendMessageAgain(message)} />;
      }
    });
  };

  useEffect(() => {
    if (!contactId) {
      return;
    }
    const conversation = messagesRecieved.get(contactId);
    if (conversation) {
      setMessages(conversation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesRecieved]);

  const sendMessageAgain = (message: Message) => {
    // set failed message to deleted flag
    message.flags = 3;
    setMessageAtIndex(contactInfo.contactID, message.index, message);

    // retry sending message with new index and timestamp
    sendMessageWrapper(message.text, 0, contactId);
  };

  // send message to contact
  const sendText = async (message: string) => {
    input.current.clear();
    setMessageText('');
    if (message !== '') {
      let messageID = await sendMessageWrapper(message, 0, contactId);

      // add message to local pending messages, which is only used for ui purposes
      // visualizes pending messages in chat
      const localPending: Message = {
        messageID: messageID,
        text: message,
        timestamp: Date.now(),
        flags: 4, // local pending
        isReciever: false,
        index: -1,
      };
      setLocalPendingMessages([...localPendingMessages, localPending]);
    }
  };

  // set contact info
  useEffect(() => {
    if (!contactId) {
      return;
    }
    setContactInfo(getOrCreateContactInfo(contactId));
  }, [contactId]);

  // listen to global state of connections and update whether chat is isConnected
  useEffect(() => {
    setIsConnected(connections.includes(contactId));
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

  if (contactInfo === undefined || !contactId) {
    return <View />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ChatHeader
        navigation={navigation}
        contactId={contactId}
        isConnected={isConnected}
        lastSeen={contactInfo.lastSeen}
        name={contactInfo.name}
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
