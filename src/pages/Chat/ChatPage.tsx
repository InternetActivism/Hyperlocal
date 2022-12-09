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
import { connectionsAtom, messagesRecievedAtom } from '../../services/atoms';
import { sendMessage } from '../../services/bridgefy-link';
import {
  addPendingMessage,
  ContactInfo,
  getContactInfo,
  getOrCreateContactInfo,
  Message,
  RawMessage,
} from '../../services/database';

/*
  id: number;
  bridgefyID: string;
  text: string;
  timestamp: number;
  isReciever: boolean;
*/

const ChatPage = ({ route, navigation }) => {
  const { user: contactId } = route.params;
  const [messagesRecieved] = useAtom(messagesRecievedAtom);
  const [connections] = useAtom(connectionsAtom);
  const [messageText, setMessageText] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo>(
    {} as ContactInfo,
  );

  const input: any = createRef();
  const scrollViewRef: any = useRef();

  // scroll down to bottom of chat
  const scrollDown = () => {
    if (scrollViewRef.current === null) {
      return;
    }
    scrollViewRef.current.scrollToEnd({ animated: true });
  };

  // render all messages recieved from contact
  const renderBubbles = () => {
    const allMessages: Message[] | undefined = messagesRecieved.get(contactId);
    if (allMessages === undefined) {
      return;
    }
    return allMessages.map((textMessage: Message) => {
      if (textMessage.flags === 0) {
        return <TextBubble message={textMessage} />;
      }
    });
  };

  // send message to contact
  const sendText = () => {
    if (messageText === '' || !isConnected || !input?.current) {
      return;
    }
    const messageObj: RawMessage = {
      text: messageText,
      flags: 0,
    };
    const messageRaw = JSON.stringify(messageObj);
    const messageID = sendMessage(messageRaw, contactId);
    addPendingMessage({
      messageID,
      text: messageRaw,
      timestamp: Date.now(),
      recipient: contactId,
      flags: 0,
    });
    input.current.clear();
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
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        scrollDown();
      },
    );

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
        style={styles.container}>
        <ScrollView
          style={{ backgroundColor: '#fff', flex: 1 }}
          ref={scrollViewRef}
          onContentSizeChange={(width, height) => scrollDown()}>
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
            disabled={!isConnected}
            onPress={() => sendText()}
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
