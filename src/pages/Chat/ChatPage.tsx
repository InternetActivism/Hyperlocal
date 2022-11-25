import { Button, Text } from '@rneui/themed';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { ChatHeader, TextBubble, TextInput } from '../../components';
import {
  connectionsAtom,
  messagesRecievedAtom,
  pendingMessageAtom,
} from '../../services/atoms';
import { sendMessage } from '../../services/bridgefy-link';

/*
  id: number;
  bridgefyID: string;
  text: string;
  timestamp: number;
  isReciever: boolean;
  */

const ChatPage = ({ navigation }) => {
  const [messagesRecieved, setMessagesRecieved] = useAtom(messagesRecievedAtom);
  const [connections, setConnections] = useAtom(connectionsAtom);
  const [pendingMessage, setPendingMessage] = useAtom(pendingMessageAtom);
  const [message, setMessage] = useState<string>('');

  const sendText = () => {
    console.log('pending before: ', pendingMessage);
    console.log('sending from chat with message: ', message);
    setPendingMessage(message);
    console.log('pending on chat page: ', pendingMessage);
    if (connections.length === 0) {
      console.log('No connected users');
      return;
    }
    if (message.length === 0) {
      console.log('No message');
      return;
    }
    // sendMessage(message, connections[0]);
  };

  useEffect(() => {
    console.log('calling send message with message: ', pendingMessage);
    sendMessage(pendingMessage, connections[0]);
  }, [pendingMessage]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ChatHeader navigation={navigation} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView style={{ backgroundColor: '#fff', flex: 1 }}>
          {messagesRecieved.map(textMessage => {
            return <TextBubble message={textMessage} />;
          })}
        </ScrollView>
        <View style={styles.inputContainer}>
          <TextInput
            text={message}
            onChangeText={(value: string) => {
              setMessage(value);
            }}
          />
          <Button
            title="^"
            buttonStyle={styles.sendButton}
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
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00f',
  },
});

export default ChatPage;
