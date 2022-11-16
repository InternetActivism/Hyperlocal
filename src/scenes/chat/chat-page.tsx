import { Button, Text } from '@rneui/themed';
import React from 'react';
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
import { Message } from '../../services/database';

/*
  id: number;
  bridgefyID: string;
  text: string;
  timestamp: number;
  isReciever: boolean;
  */

const ChatPage = ({ navigation }) => {
  const sampleMessages: Message[] = [
    {
      id: 1,
      bridgefyID: '1',
      text: 'Hey Krish',
      timestamp: 0,
      isReciever: false,
    },
    {
      id: 2,
      bridgefyID: '2',
      text: 'Hey Adrian',
      timestamp: 1,
      isReciever: true,
    },
    {
      id: 3,
      bridgefyID: '3',
      text: 'How are you?',
      timestamp: 2,
      isReciever: false,
    },
    ,
  ];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ChatHeader navigation={navigation} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView style={{ backgroundColor: '#000', flex: 1 }}>
          {sampleMessages.map(message => {
            return <TextBubble message={message} />;
          })}
          {sampleMessages.map(message => {
            return <TextBubble message={message} />;
          })}
          {sampleMessages.map(message => {
            return <TextBubble message={message} />;
          })}
          {sampleMessages.map(message => {
            return <TextBubble message={message} />;
          })}
          {sampleMessages.map(message => {
            return <TextBubble message={message} />;
          })}
          {sampleMessages.map(message => {
            return <TextBubble message={message} />;
          })}
        </ScrollView>
        <TextInput />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ChatPage;
